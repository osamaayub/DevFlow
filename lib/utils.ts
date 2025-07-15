import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { techMap } from "@/constants/techMap"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDevinconClassName=(techName:string)=>{
 const normalizeTechName=techName.replace(/[.]/g,"").toLowerCase()

 return techMap[normalizeTechName]?`${techMap[normalizeTechName]} colored}`:"devicon-devicon-plain"
}