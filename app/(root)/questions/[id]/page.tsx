import React from "react"

const  QuestionDetails=async ({ params }: { params: Promise<{ id: string }> })=> {
   const {id}=  await params;

  return (
    <div>
     Question page :{id}
    </div>
  )
}

export default QuestionDetails