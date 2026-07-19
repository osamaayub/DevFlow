

export const Routes = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE:(id:string)=>`Profile/${id}`,
  TAGS:(id:string)=>`tags/${id}`,
  Ask_A_Question:"/ask-question",
  QUESTION:(id:string)=>`/question/${id}`
};
