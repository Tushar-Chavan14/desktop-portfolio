import React from "react";
import DateAndTime from "./dateAndTime";
import Navlinks from "./navlinks";

const TopPanel = () => {
  return (
    <div className="w-screen flex justify-between py-1 px-4">
      <DateAndTime />
      <Navlinks />
      <div>controlPanel</div>
    </div>
  );
};

export default TopPanel;
