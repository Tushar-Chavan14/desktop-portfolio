import React from "react";
import DateAndTime from "./dateAndTime";
import Navlinks from "./navlinks";
import ControlCenter from "./controlCenter";

const TopPanel = () => {
  return (
    <div className="w-screen flex justify-between py-1 px-1 bg-mocha-crust">
      <DateAndTime />
      {/* <Navlinks /> */}
      <ControlCenter />
    </div>
  );
};

export default TopPanel;
