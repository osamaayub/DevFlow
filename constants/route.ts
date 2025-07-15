export const Routes = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE:(id:string)=>`profile/${id}`,
  TAGS:(id:string)=>`tags/${id}`
};
