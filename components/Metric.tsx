import Link from "next/link"
import Image from "next/image";

interface MetricProps{
  imgUrl:string,
  alt:string,
  title:string,
  value:string|number,
  href:string,
  textStyles:string,
  isAuthor?:boolean
  imgStyles:string
}

const Metric = ({imgUrl ,imgStyles,alt,title,value,href,textStyles,isAuthor}:MetricProps) => {

  const metricContent=(
    <>
      <Image src={imgUrl} alt={alt} width={16} height={16} className={`rounded-full object-contain ${imgStyles}`}/>
     <p className={`${textStyles} flex items-center gap-1`}>{value}</p>
      <span className={`small-regular line-clamp-1 ${isAuthor ?"max-sm:hidden":""}`}>{title}</span>
    </>
  )
  return href ? (
   <Link href={href} className="flex-center gap-1">
     {metricContent}
   </Link>
  ):<div className="flex-center gap-1">
    {metricContent}
  </div>
}

export default Metric