import Link from "next/link";

import ROUTES from "@/constants/route";

import { UserAvatar } from "../shared";



interface UserCardProps {
  _id: string;
  name: string;
  username: string;
  image?: string;
}

const UserCard = ({ _id, name, image, username }: UserCardProps) => {
  return (
    <Link 
      href={ROUTES.PROFILE(_id)}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-65"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:shadow-md">
        <UserAvatar
          id={_id}
          name={name}
          image={image}
          disableLink
          className="size-25 rounded-full object-cover"
          fallbackClassName="text-3xl tracking-widest"
        />

        <div className="mt-4 text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1">
            {name}
          </h3>
          <p className="body-regular text-dark500_light500 mt-2">
            @{username}
          </p>
        </div>
      </article>
    </Link>
  );
};

export default UserCard;