import mongoose,{Mongoose} from "mongoose";
import { MongoClient } from "mongodb";



const MONGODB_URI=process.env.MONGODB_URI as string;


if(!MONGODB_URI){
    throw new Error("MONGODB_URI is not defined in the env");
}

interface MongooseCache{
    conn:Mongoose|null,
    promise:Promise<Mongoose>|null;
}

declare global{
    var mongoose:MongooseCache
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}
let cached=global.mongoose;

if(!cached){
cached=global.mongoose={conn:null,promise:null}
}

export const dbConnect=async():Promise<Mongoose>=>{
 if(cached.conn){
    return cached.conn;
 }
 if(!cached.promise){
    cached.promise=mongoose.connect(MONGODB_URI,{
        dbName:'DevFlow'
    }).then((res)=>{
       console.log("connected to mongodb");
       return res;
    }).catch((error:any)=>{
        console.log("error connecting to mongodb",error);
        throw error;
    });
 }
 cached.conn=await cached.promise;
 return cached.conn;
}

// For NextAuth MongoDBAdapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

