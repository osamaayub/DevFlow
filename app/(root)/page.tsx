import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Routes } from "@/constants/route";

const Home = async () => {
  const session = await auth();
  return (
    <form
      className="px-10 pt-[100px]"
      action={async () => {
        "use server";
        await signOut({
          redirectTo: Routes.SIGN_IN,
        });
      }}
    >
      <Button type="submit">Logout</Button>
    </form>
  );
};
export default Home;
