import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { QuestionForm } from "@/components/forms/QuestionForm"

export default async function AskQuestion() {
  const session = await auth();
  const userId = session?.user?.id ? String(session.user.id) : null;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Public Question</h1>
      <div className="mt-9">
        <QuestionForm />
      </div>
    </div>
  );
}