import {Account} from "@/database/models";
import {HandleError} from "@/lib/handlers";
import {dbConnect} from "@/lib/mongoose";
import {NextRequest, NextResponse} from "next/server";

export async function GET(){
  try{
    await  dbConnect();
    const accounts = await Account.find();
    return NextResponse.json({success: true, data: accounts},{status:200});

  }catch(error: unknown){
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  }
}
export async function POST(request: NextRequest){
  try{
    await dbConnect();
    const body = await request.json();
    const existingAccount = await Account.findOne({email: body.email});

    if(existingAccount){
      throw new Error("Account already exists");
    }       
    const newAccount = new Account(body);
    await newAccount.save();
    return NextResponse.json({success: true, data: newAccount},{status:201}); 
  }catch(error: unknown){
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return HandleError(errorMessage) as unknown as ApiErrorResponse;
  } 
}