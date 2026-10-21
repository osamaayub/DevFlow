import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined")
}

await mongoose.connect(mongoUri, { dbName: "DevFlow" })

const db = mongoose.connection.db
const questions = db.collection("questions")
const tags = db.collection("tags")
const tagQuestions = db.collection("tagquestions")

const seedTagRules = [
  { pattern: /next(?:\.js)?/i, name: "Next.js" },
  { pattern: /mongodb/i, name: "MongoDB" },
  { pattern: /typescript/i, name: "TypeScript" },
  { pattern: /node(?:\.js)?/i, name: "Node.js" },
  { pattern: /react/i, name: "React" },
  { pattern: /\bcss\b/i, name: "CSS" },
  { pattern: /auth(?:entication)?/i, name: "Authentication" },
  { pattern: /test(?:ing)?/i, name: "Testing" },
]

const getSeedTagNames = (question) => {
  const text = `${question.title ?? ""} ${question.content ?? ""}`
  return seedTagRules.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name)
}

const getOrCreateTag = async (name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return tags.findOneAndUpdate(
    { name: { $regex: `^${escapedName}$`, $options: "i" } },
    { $setOnInsert: { name, questions: 0, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  )
}

const cursor = questions.find({ $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] })
let repaired = 0
let skipped = 0

for await (const question of cursor) {
  const tagNames = getSeedTagNames(question)
  if (tagNames.length === 0) {
    skipped += 1
    continue
  }

  const tagIds = []
  for (const name of tagNames) {
    const tag = await getOrCreateTag(name)
    if (!tag?._id) continue

    tagIds.push(tag._id)
    const relation = await tagQuestions.updateOne(
      { question: question._id, tag: tag._id },
      {
        $setOnInsert: {
          question: question._id,
          tag: tag._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    if (relation.upsertedCount > 0) {
      await tags.updateOne({ _id: tag._id }, { $inc: { questions: 1 } })
    }
  }

  await questions.updateOne(
    { _id: question._id },
    { $set: { tags: tagIds, updatedAt: new Date() } }
  )
  repaired += 1
}

console.log(`Question tag backfill complete: repaired ${repaired}, skipped ${skipped}.`)
await mongoose.disconnect()
