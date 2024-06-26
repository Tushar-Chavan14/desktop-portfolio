"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navlinks = () => {
  const pathname = usePathname();

  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "About",
      href: "/about",
    },
    {
      name: "portfolio",
      href: "/portfolio",
    },
    {
      name: "Blogs",
      href: "/blogs",
    },
    {
      name: "Contact",
      href: "/contact",
    },
  ];

  return (
    <div>
      <ul className="flex gap-10 bg-black rounded-full px-10 py-1">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className={`${
                link.href === pathname ? "text-white" : "text-gray-400"
              } hover:text-white`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navlinks;
