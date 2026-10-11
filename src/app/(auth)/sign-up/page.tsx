"use client";

import { signUpWithCredentials } from "@/features/auth/actions" 
import { AuthForm } from "@/features/auth/components"
import { SignUpSchema } from "@/shared/lib/validation";


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
