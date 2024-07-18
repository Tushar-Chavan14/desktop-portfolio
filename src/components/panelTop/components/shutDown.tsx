"use client";
import { Modal } from "@src/components/modal";
import { socialLinks } from "@src/constants";
import React, { useEffect, useState } from "react";

const ShutDownBox: React.FC<{
  setshowModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setshowModal }) => {
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setshowModal((prev) => !prev);
      window.open(socialLinks.linkdein, "_self");
    }, 4000);

    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div className="flex flex-col gap-4 items-center text-center ">
        <div>
          <h2 className="capitalize">shutting down</h2>
          <p className="capitalize">and redirecting to linkdin</p>
        </div>
        <div>
          <div className="h-10 w-10 border-4 animate-spin border-[#c59ff5] border-r-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const Shutdown: React.FC<{
  showModal: boolean;
  setshowModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ showModal, setshowModal }) => {
  const [shutdown, setshutdown] = useState<boolean>(false);

  return (
    <Modal
      shouldShow={showModal}
      onRequestClose={() => {
        setshowModal((prev) => !prev);
      }}
    >
      {!shutdown ? (
        <div>
          <h2 className="capitalize">Power off</h2>
          <p>Are you sure you want to power off?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setshowModal((prev) => !prev);
              }}
              className="bg-white/10 px-2 py-1 rounded-md"
            >
              cancel
            </button>
            <button
              onClick={(e) => {
                setshutdown((prev) => !prev);
              }}
              className="bg-red-500 px-2 py-1 rounded-md"
            >
              power off
            </button>
          </div>
        </div>
      ) : (
        <ShutDownBox setshowModal={setshowModal} />
      )}
    </Modal>
  );
};

export default Shutdown;
