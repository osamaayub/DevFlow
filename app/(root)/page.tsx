import HomeFilters from "@/components/filters/HomeFilters";
import LocalSearchBar from "@/components/search/LocalSearchBar";
import { Button } from "@/components/ui/button";
import { Routes } from "@/constants/route";
import Link from "next/link";


const Home = async () => {

  return (
    <>
    <section className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4 sm:items-center">
     <h1 className=" h1-bold text-dark100_light900">All Questions</h1>
     <Button className="primary-gradient !text-light-900 min-h-[46px] px-4 py-3" asChild>
      <Link href={ Routes.Ask_A_Question}>
      Ask a Question
      </Link>
     </Button>
    </section>
    <section className="mt-11">
     <LocalSearchBar  route="/" imgSrc={'/icons/search.svg'} placeholder="Search Questions..." otherClasses="flex-1 "/>
     </section>
     <section className="mt-11">
      <HomeFilters/>
     <div className="mt-10 flex w-full flex-col gap-6">
     <p>Question Card 1</p>
      <p>Question Card 2</p>
      <p>Question Card 3</p>
       <p>Question Card 4</p>
     </div>
     </section>
    </>
    
  );
};
export default Home;
