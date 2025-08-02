"use client";
import { useState } from "react"
import { Button } from "../ui/button"
import {useSearchParams,useRouter} from "next/navigation";
import { cn } from "@/lib/utils";
import { formUrlQuery, removeUrlQuery } from "@/lib/url";
// import { homeFilters } from "@/constants/filter";



const filters=[
  {
    name:"React", value:"react",

  },{
    name:"JavaScript",value:"javaScript"
  }
]

const HomeFilters = () => {
 const router=useRouter();
  const SearchParams=useSearchParams();
  const filterParams=SearchParams.get("filter");
  const [active,setActive]=useState(filterParams||"");


  const handleTypeClick=(filter:string)=>{
    let newUrl="";
    // if the filter is active
    if(filter===active){
       setActive("");
             newUrl=removeUrlQuery({
                  params:SearchParams.toString(),
                  keysToRemove:["filter"],
                });
                    router.push(newUrl,{scroll:false});
               }
    else{
            setActive(filter);
        newUrl=formUrlQuery({
              params:SearchParams.toString(),
              key:"filter",
              value:filter.toLowerCase()
            })
          router.push(newUrl,{scroll:false});

    }
  }


  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">{filters.map((filter)=>(
        <Button onClick={()=>{handleTypeClick(filter.value)}} className={cn(`body-medium rounded-lg px-6 py-3 capitalize shadow-none`,active===filter.value ?"bg-primary-100  text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400" :"bg-light-800 text-light-500 hover:bg-light-800  dark:text-light-500 dark:bg-dark-300")} key={filter.name}>{filter.name}</Button>
    ))}</div>
  )
}

export default HomeFilters