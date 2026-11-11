// Removes seeded "[DevFlow badge test question]" posts and everything attached to them.
// Mirrors deleteQuestion: answers, votes, saves, tag links, views and interactions go too,
// tag counts are decremented, and the post reputation (+5 per question, +10 per answer) is reversed.
//
// Dry run (default, changes nothing):  MONGODB_URI="..." node scripts/cleanup-test-questions.mjs
// Apply:                               MONGODB_URI="..." node scripts/cleanup-test-questions.mjs --apply
import mongoose from "mongoose";

const TITLE = /^\[DevFlow badge test question\]/;
const APPLY = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI first.");
  process.exit(1);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
const c = (name) => db.collection(name);

const questions = await c("questions").find({ title: TITLE }, { projection: { _id: 1, author: 1, tags: 1 } }).toArray();
const qIds = questions.map((q) => q._id);
const answers = await c("answers").find({ question: { $in: qIds } }, { projection: { _id: 1, author: 1 } }).toArray();
const aIds = answers.map((a) => a._id);

// How many test questions each tag loses
const tagLoss = new Map();
for (const q of questions) for (const t of q.tags ?? []) tagLoss.set(String(t), (tagLoss.get(String(t)) ?? 0) + 1);

// Post reputation to take back from each author
const repLoss = new Map();
const add = (id, n) => repLoss.set(String(id), (repLoss.get(String(id)) ?? 0) + n);
for (const q of questions) add(q.author, 5);
for (const a of answers) add(a.author, 10);

const counts = {
  questions: qIds.length,
  answers: aIds.length,
  votes: await c("votes").countDocuments({ $or: [{ id: { $in: qIds }, type: "question" }, { id: { $in: aIds }, type: "answer" }] }),
  collections: await c("collections").countDocuments({ question: { $in: qIds } }),
  tagquestions: await c("tagquestions").countDocuments({ question: { $in: qIds } }),
  questionviews: await c("questionviews").countDocuments({ question: { $in: qIds } }),
  interactions: await c("interactions").countDocuments({ actionId: { $in: [...qIds, ...aIds] } }),
};
console.log(APPLY ? "APPLYING cleanup:" : "DRY RUN (nothing changed). Would remove:", counts);
console.log("Tag counts to decrease:", Object.fromEntries(tagLoss));
console.log("Reputation to remove per user:", Object.fromEntries(repLoss));

if (!APPLY || qIds.length === 0) {
  if (!APPLY) console.log("\nRun again with --apply to delete.");
  await mongoose.disconnect();
  process.exit(0);
}

const run = async (session) => {
  const o = session ? { session } : {};
  await c("votes").deleteMany({ $or: [{ id: { $in: qIds }, type: "question" }, { id: { $in: aIds }, type: "answer" }] }, o);
  await c("collections").deleteMany({ question: { $in: qIds } }, o);
  await c("tagquestions").deleteMany({ question: { $in: qIds } }, o);
  await c("questionviews").deleteMany({ question: { $in: qIds } }, o);
  await c("interactions").deleteMany({ actionId: { $in: [...qIds, ...aIds] } }, o);
  await c("answers").deleteMany({ question: { $in: qIds } }, o);
  for (const [tagId, n] of tagLoss) {
    await c("tags").updateOne({ _id: new mongoose.Types.ObjectId(tagId) }, { $inc: { questions: -n } }, o);
  }
  for (const [userId, n] of repLoss) {
    // Never let reputation go below zero
    await c("users").updateOne({ _id: new mongoose.Types.ObjectId(userId) },
      [{ $set: { reputation: { $max: [0, { $subtract: [{ $ifNull: ["$reputation", 0] }, n] }] } } }], o);
  }
  await c("questions").deleteMany({ _id: { $in: qIds } }, o);
  // Remove tags that no longer have any questions
  const emptyTags = await c("tags").find({ questions: { $lte: 0 } }, { projection: { _id: 1, name: 1 }, ...o }).toArray();
  for (const t of emptyTags) {
    if ((await c("tagquestions").countDocuments({ tag: t._id }, o)) === 0) await c("tags").deleteOne({ _id: t._id }, o);
  }
  return emptyTags.map((t) => t.name);
};

const session = await mongoose.startSession();
let removedTags;
try {
  await session.withTransaction(async () => { removedTags = await run(session); });
} catch (err) {
  // Standalone MongoDB (no replica set) has no transactions
  if (/Transaction numbers|replica set/i.test(String(err))) removedTags = await run(null);
  else throw err;
} finally {
  await session.endSession();
}
console.log("Done. Empty tags removed:", removedTags);
await mongoose.disconnect();
