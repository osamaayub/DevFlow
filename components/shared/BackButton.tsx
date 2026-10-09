"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui"
import ROUTES from "@/constants/route"

const BackButton = ({
  className,
  href = ROUTES.HOME,
}: {
  className?: string
  href?: string
}) => {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => router.push(href)}
      aria-label="Go back"
      className={`-ml-4 w-fit self-start text-dark400_light700 hover:text-dark100_light900 ${className || ""}`}
    >
      <Image
        src="/icons/arrow-left.svg"
        alt="Back"
        width={24}
        height={24}
        className="invert-colors"
      />
      <span>Back</span>
    </Button>
  )
}

export default BackButton
