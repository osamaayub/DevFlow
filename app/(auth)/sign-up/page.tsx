"use client";

import { AuthForm } from "@/components/forms";
import { signUpWithCredentials } from "@/lib/actions"; 
import { SignUpSchema } from "@/lib/validation";


const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      formType="SIGN_UP"
      defaultValues={{email:"",username:"",name:"",password:"" }}
      onSubmitAction={(data) => signUpWithCredentials(data)}
    />
  );
};

export default SignUp;
