import mongoose,{Mongoose} from "mongoose";



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

