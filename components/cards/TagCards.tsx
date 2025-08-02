import { Routes } from "@/constants/route"
import  Link  from "next/link"
import { Badge } from "../ui/badge"
import { getDevinconClassName } from "@/lib/utils"

interface Props{
    _id:string,
    name:string,
    questions?:number,
    showCount?:boolean,
    compact?:boolean
}

const TagCards = ({_id,name,questions,showCount,compact}:Props) => {
  const iconClass=getDevinconClassName(name);
  return (
    <>
    <Link href={Routes.TAGS(_id)} className="flex justify-between gap-2">
      <Badge className=" subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
       <i className={`${iconClass} text-sm`}></i>
       <span>{name}</span>
        </div>
        </Badge>
        {showCount && (
          <p className="small-medium text-dark500_light700">{questions}</p>
        )}
    </Link>
    </>
  )
}

export default TagCards
