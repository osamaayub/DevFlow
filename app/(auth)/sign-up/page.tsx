"use client";

import { AuthForm } from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions"; 
import { SignUpSchema } from "@/lib/validation";


const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      formType="SIGN_UP"
      defaultValues={{email:"",username:"",name:"",password:"" }}
      onSubmitAction={(data) => signUpWithCredentials({ params: data })}     // ✅ Wrap here

    />
  );
};

export default SignUp;