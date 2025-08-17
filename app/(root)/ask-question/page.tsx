import { QuestionForm } from "@/components/forms/QuestionForm";


const AskQuestion = () => {
  return (
    <>
    <h1 className="h1-bold text-dark100_light900">Ask a Public Question</h1>
    <div className="mt-9">
     <QuestionForm/>
    </div>
  </>
  );
};

export default AskQuestion;
