"use client";
import React, { useEffect, useState } from "react";
import { useNetworkState } from "@uidotdev/usehooks";
import { MdSettingsEthernet } from "react-icons/md";
import { FiWifi } from "react-icons/fi";
import { FiWifiOff } from "react-icons/fi";
import { BsFillArrowDownSquareFill } from "react-icons/bs";

enum VarrientEnum {
  icon = "icon",
  info = "info",
}

const NetworkStatus = ({ varrient }: { varrient: string }) => {
  const { online, type, downlink } = useNetworkState();

  const isValidType = [
    "bluetooth",
    "cellular",
    "none",
    "wifi",
    "wimax",
    "other",
    "unknown",
    "undefined",
  ].includes(type ? type : "undefined");

  if (varrient === VarrientEnum.icon) {
    if (!online) {
      return <FiWifiOff className=" size-4" />;
    }

    return (
      <>
        {type === "wifi" ? (
          <FiWifi className=" size-4" />
        ) : type === "ethernet" ? (
          <MdSettingsEthernet className=" size-4" />
        ) : (
          <FiWifi className=" size-4" />
        )}
      </>
    );
  }

  if (varrient === VarrientEnum.info) {
    return (
      <>
        {type === "ethernet" || undefined ? (
          <>
            {online ? (
              <div className="flex justify-around items-center">
                <MdSettingsEthernet className=" size-4" /> <p>connected</p>{" "}
                <BsFillArrowDownSquareFill /> <p>{downlink?.toFixed(2)} Mbps</p>
              </div>
            ) : (
              <div>
                <FiWifiOff className=" size-4" /> <p>disconnected</p>
              </div>
            )}
          </>
        ) : (
          isValidType && (
            <>
              {online ? (
                <div className=" flex gap-4 items-center ">
                  <FiWifi className=" size-4" /> <p>connected</p>
                  {downlink && <BsFillArrowDownSquareFill />}
                  {downlink && <p>{downlink?.toFixed(2)} Mbps</p>}
                </div>
              ) : (
                <div>
                  <FiWifiOff className=" size-4" /> <p>disconnected</p>
                </div>
              )}
            </>
          )
        )}
      </>
    );
  }
};

const Network = ({ varrient }: { varrient: string }) => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <FiWifiOff className=" size-4" />;
  }

  return <>{isClient && <NetworkStatus varrient={varrient} />}</>;
};

export default Network;
