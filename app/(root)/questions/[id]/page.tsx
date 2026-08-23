import React from "react"

const  QuestionDetails=async (params:RouteParams)=> {
   const {id}= await  params;

  return (
    <div>
     Question page :{id}
    </div>
  )
}

export default QuestionDetails