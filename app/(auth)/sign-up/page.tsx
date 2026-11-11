"use client";

import { signUpWithCredentials } from "@/features/auth/actions" 
import { AuthForm, AuthPanel } from "@/features/auth/components"
import { SignUpSchema } from "@/shared/lib/validation";


const SignUp = () => {
  return (
    <AuthPanel
      title="Join DevFlow"
      description="Get your questions answered"
      showSocialAuth
    >
      <AuthForm
        schema={SignUpSchema}
        formType="SIGN_UP"
        defaultValues={{email:"",username:"",name:"",password:"" }}
        onSubmitAction={(data) => signUpWithCredentials(data)}
      />
    </AuthPanel>
  );
};

export default SignUp;
