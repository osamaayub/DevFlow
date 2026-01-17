import Link from "next/link";

import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/filters/HomeFilters";
import LocalSearchBar from "@/components/search/LocalSearchBar";
import { Button } from "@/components/ui/button";
import { questions } from "@/constants/filter";
import { Routes } from "@/constants/route";



interface SearchParams{
  searchParams:Promise<{[key:string]:string}>
}
const Home = async ({searchParams}:SearchParams) => {
  
  const {query="",filter=""}=await searchParams;
    const filteredQuestions = questions.filter((question) => {
    const matchesQuery = question.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter = filter
      ? question.tags[0].name.toLowerCase() === filter.toLowerCase()
      : true;
    return matchesQuery && matchesFilter;
  });


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
      {filteredQuestions.map((question)=>(
       <QuestionCard key={question._id} question={question}/>
      ))}

     </div>
     </section>
    </>
    
  );
};
export default Home;
