import Image from "next/image"
import Link from "next/link"

interface Props {
  imgUrl: string
  title: string
  href?: string
}

const ProfileLink = ({ imgUrl, title, href }: Props) => (
  <div className="flex min-w-0 max-w-full items-center gap-1">
    <Image src={imgUrl} alt="" width={16} height={16} loading="lazy" sizes="16px" className="shrink-0" />

    {href ? (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className="small-medium min-w-0 truncate whitespace-nowrap text-link-100"
      >
        {title}
      </Link>
    ) : (
      <p
        title={title}
        className="small-medium min-w-0 truncate whitespace-nowrap text-dark400_light700"
      >
        {title}
      </p>
    )}
  </div>
)

export default ProfileLink
