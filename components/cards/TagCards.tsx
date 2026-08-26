import Image from "next/image"
import Link from "next/link"

import  Routes  from "@/constants/route"
import { getDevinconClassName } from "@/lib/utils"

import { Badge } from "../ui/badge"



interface Props {
  _id: string,
  name: string,
  questions?: number,
  showCount?: boolean,
  compact?: boolean,
  remove?: boolean,
  isButton?: boolean,
  handleRemove?: () => void
}

const TagCards = ({ _id, name, compact, remove, isButton, handleRemove }: Props) => {
  const iconClass = getDevinconClassName(name);
  const Content = (
    <>
      <Badge className=" subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase flex flex-row gap-2">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
        {remove && (
          <Image
            src="/icons/close.svg"
            alt="close icon"
            width={12}
            height={12}
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>
    </>
  );

  return compact ? (
    isButton ? (
      <button className="flex justify-between gap-2">
        {Content}
      </button>
    ) : (
      <>
        <Link href={Routes.TAG(_id)} className="flex justify-between gap-2">
          {Content}
        </Link>
      </>
    )) : null
}
export default TagCards
