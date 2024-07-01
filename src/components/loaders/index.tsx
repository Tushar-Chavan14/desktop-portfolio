import React from "react";

export const Spinner = () => {
  return (
    <div>
      <div className="relative w-3 h-3">
        <div className="absolute w-full h-full border-4 animate-spin border-solid border-blue-500 border-t-transparent rounded-full top-0 left-0"></div>
      </div>
    </div>
  );
};
