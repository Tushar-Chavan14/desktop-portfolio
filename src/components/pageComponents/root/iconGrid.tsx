"use client";

import React from "react";
import DraggableGrid from "./DraggableGrid";
import { FcManager } from "react-icons/fc";

const IconGrid = () => {
  return (
    <DraggableGrid
      iconItems={[
        {
          id: "1",
          index: 0,
          icon: FcManager,
          clickHandler: () => console.log("clicked"),
          label: "Profile",
        },
      ]}
    />
  );
};

export default IconGrid;
