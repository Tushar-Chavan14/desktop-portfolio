"use client";
import React, { useEffect } from "react";
import useBackgroundStore from "@src/store/zustore/useBackgroundStore";

const WallpaperWrapper = ({ children }: { children: React.ReactNode }) => {
  const { currentBackground, setAvailableBackgrounds } = useBackgroundStore();

  useEffect(() => {
    // Load available backgrounds on mount
    const loadBackgrounds = async () => {
      try {
        const response = await fetch("/api/backgrounds");
        const data = await response.json();
        setAvailableBackgrounds(data.backgrounds);
      } catch (error) {
        console.error("Failed to load backgrounds:", error);
      }
    };

    loadBackgrounds();
  }, []);

  return (
    <div
      className="h-screen bg-fixed bg-cover bg-center -z-50 transition-all duration-500 ease-in-out"
      style={{
        backgroundImage: `url('${currentBackground}')`,
      }}
    >
      {children}
    </div>
  );
};

export default WallpaperWrapper;
