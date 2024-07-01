"use client";
import React, { useEffect, useState } from "react";
import { useNetworkState } from "@uidotdev/usehooks";
import { MdSettingsEthernet } from "react-icons/md";
import { FiWifi } from "react-icons/fi";
import { FiWifiOff } from "react-icons/fi";

const NetworkStatus = () => {
  const { online, type } = useNetworkState();

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
};

const Network = () => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <FiWifiOff className=" size-4" />;
  }

  return <>{isClient && <NetworkStatus />}</>;
};

export default Network;
