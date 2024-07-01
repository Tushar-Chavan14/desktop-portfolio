"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { navLinks as links } from "@src/constants/panel";

const Navlinks = () => {
  const pathname = usePathname();

  return (
    <div>
      <ul className="flex gap-10 bg-black rounded-full panel-p-default">
        {links.map((link, index) => (
          <li key={index + link.href}>
            <Link
              href={link.href}
              prefetch={true}
              className={`${
                link.href === pathname
                  ? " text-white bg-indigo-500 hover:text-white px-8 rounded-full "
                  : "text-gray-400 hover:text-indigo-500"
              }  transition-all ease-in-out duration-700`}
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
