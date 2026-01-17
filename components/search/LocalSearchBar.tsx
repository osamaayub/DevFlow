"use client"
import Image from "next/image"
import { useSearchParams,useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { formUrlQuery, removeUrlQuery } from "@/lib/url"

import { Input } from "../ui/input"



interface Props{
    route:string,
    imgSrc:string,
    placeholder:string,
    otherClasses?:string
}

const LocalSearchBar = ({imgSrc,route,placeholder,otherClasses}:Props) => {
  const SearchParams=useSearchParams();
  const pathname=usePathname();
  const query=SearchParams.get("query") ||"";
  const [searchQuery,setSearchQuery]=useState(query);
  const router=useRouter();
  useEffect(()=>{
    const delayDebounceFn=setTimeout(()=>{
       if(searchQuery){
      const newUrl=formUrlQuery({
        params:SearchParams.toString(),
        key:"query",
        value:searchQuery
      })
      router.push(newUrl,{scroll:false});
    }
    else{
       if(pathname===route){
        const newUrl=removeUrlQuery({
          params:SearchParams.toString(),
          keysToRemove:["query"],
        });
        router.push(newUrl,{scroll:false});
       }
    }
    return ()=>clearTimeout(delayDebounceFn);
    },300);
  },[searchQuery,route,SearchParams,pathname]);
  return (
    <div className={`background-light800_darkgradient flex min-[h-56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}>
        <Image src={imgSrc} alt="search icon" width={24} height={24}
        className="cursor-pointer"
        />
        <Input type="text"  
        placeholder={placeholder} 
        value={searchQuery}
        onChange={(e)=>{setSearchQuery(e.target.value)}}
        className="paragraph-regular no-focus placeholder text-dark400_light800 border-none shadow-none outline-none"/>
    </div>
  )
}

export default LocalSearchBar