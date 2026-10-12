"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { SheetClose } from "@/shared/components/ui";
import { sidebarLinks } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";

type Props = {
  isMobileNav?: boolean
  userId?: string
  hideProfile?: boolean
}

const NavLinks = ({ isMobileNav, userId, hideProfile }: Props) => {
  const pathname = usePathname();
  return (
    <>
      {sidebarLinks.map((item) => {
        if (hideProfile && item.route === "/profile") return null;

        const route =
          item.route === "/profile"
            ? userId
              ? `${item.route}/${userId}`
              : null
            : item.route;

        if (!route) return null;

        const isActive =
          (pathname.includes(route) && route.length > 1) || pathname === route;

        const LinkComponent = (
          <Link
            href={route}
            key={item.label}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-light-900 hover:bg-dark300/50",
              "flex items-center justify-start gap-4 bg-transparent p-2 transition-colors",
            )}
          >
            <Image
              src={item.imgURL}
              alt={item.label}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p
              className={cn(
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden",
              )}
            >
              {item.label}
            </p>
          </Link>
        );
        return isMobileNav ? (
          <SheetClose asChild key={item.route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={item.route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
