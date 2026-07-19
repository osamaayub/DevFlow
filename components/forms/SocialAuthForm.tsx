"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { Routes } from "@/constants/route";
import logger from "@/lib/logger";

import { Button } from "../ui/button";

const SocialAuthForm = () => {
  const ButtonClass =
    "background-dark400_light900 body-medium text-dark200_light900 min-h-12 flex-1 rounded-2 px-4 py-3.5";

  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: Routes.HOME,
      });
      toast.success("Sign in successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        {
          err: error,
          message: errorMessage,
          provider,
        },
        "Social authentication failed during OAuth provider request",
      );
      toast.error("Social sign-in failed. Please refresh and try again.");
    }
  };
  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2.5">
        <Button className={ButtonClass} onClick={() => handleSignIn("google")}>
          <Image
            src="/icons/google.svg"
            alt="google logo"
            width="20"
            height="20"
            className="mr-2.5 object-contain"
          />
          <span className="">Login With Google</span>
        </Button>
        <Button className={ButtonClass} onClick={() => handleSignIn("github")}>
          <Image
            src="/icons/github.svg"
            alt="github logo"
            width="20"
            height="20"
            className=" invert-colors mr-2.5 object-contain"
          />
          <span className="">Login With Github</span>
        </Button>
      </div>
    </>
  );
};

export default SocialAuthForm;
