"use client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import Calender from "./components/calender";
import React, {
  useEffect,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  Fragment,
} from "react";
import { formatedDateTime } from "@src/helper";
import WhetherCard from "./components/whetherCard";

const DateAndTime = () => {
  const { timeStr, dateElements } = formatedDateTime();

  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setisOpen] = useState<boolean>(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setisOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Fragment>
      <Menu>
        {({ open }) => (
          <>
            <MenuButton
              ref={buttonRef}
              onClick={() => setisOpen(!isOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-black py-1 px-4 text-sm/6 font-semibold focus:outline-none data-[hover]:bg-gray-800 data-[open]:bg-gray-800 data-[focus]:outline-1 data-[focus]:outline-white"
            >
              {timeStr}
            </MenuButton>
            <Transition
              show={isOpen}
              enter="transition ease-out duration-75"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems
                ref={menuRef}
                anchor="bottom start"
                className=" w-1/3 my-1 rounded border border-white/5 bg-[#0f0f0f]/80 text-sm/6"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the menu from closing
                }}
              >
                <MenuItem>
                  <div className="flex gap-2 px-2 py-2 leading-10">
                    <div className="w-1/2">
                      <WhetherCard />
                    </div>
                    <div className=" w-1/2 flex flex-col flex-wrap gap-2">
                      <div className="w-ful  flex flex-col flex-1 rounded-md px-3 py-1 bg-gray-600">
                        <p className=" text-lg font-medium">
                          {dateElements?.dayName}
                        </p>
                        <h3 className=" text-2xl font-light">
                          {dateElements?.monthInFull} {dateElements?.day}{" "}
                          {dateElements?.year}
                        </h3>
                      </div>
                      <div className="rounded-md px-3 py-1 bg-gray-600">
                        <Calender />
                      </div>
                    </div>
                  </div>
                </MenuItem>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    </Fragment>
  );
};

export default DateAndTime;
