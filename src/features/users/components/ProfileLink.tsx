import Image from "next/image"
import Link from "next/link"

interface Props {
  imgUrl: string
  title: string
  href?: string
}

const ProfileLink = ({ imgUrl, title, href }: Props) => (
  <div className="flex-center shrink-0 gap-1 whitespace-nowrap">
    <Image src={imgUrl} alt="" width={16} height={16} className="shrink-0" />

    {href ? (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="small-medium whitespace-nowrap text-link-100"
      >
        {title}
      </Link>
    ) : (
      <p className="small-medium whitespace-nowrap text-dark400_light700">
        {title}
      </p>
    )}
  </div>
)

export default ProfileLink
