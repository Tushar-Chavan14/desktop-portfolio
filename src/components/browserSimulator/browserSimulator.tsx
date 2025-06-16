"use ref";
import React, { useEffect, useState } from "react";
import useBrowserConfig from "./browserConfig";

const BrowserSimulator: React.FC<{
  url: string;
  showToolBar: boolean;
}> = ({ url, showToolBar = true }) => {
  const { iframeRef, navigationButtons, navigateTo, historyStack, positon } =
    useBrowserConfig();

  const [addressUrl, setAddressUrl] = useState<string>(url || "");

  const getProxyUrl = (originalUrl: string) => {
    // Option 1: Use a CORS proxy service (be cautious with sensitive data)
    // return `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
return originalUrl
    // Option 2: Use allorigins.win (alternative proxy)
    // return `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
  };

  useEffect(() => {
    setAddressUrl(historyStack[positon] || "");
  }, [historyStack, positon]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex w-full bg-mocha-surface1 h-8 items-center gap-14">
        <div className=" flex items-center pl-2">
          {navigationButtons?.map((btn) => (
            <button
              key={btn.key}
              onClick={btn.clickHandler}
              {...btn.btnProps}
              className="text-purple-400 disabled:text-mocha-mantle hover:text-purple-300 p-2 rounded transition-colors"
            >
              {<btn.icon size={18} />}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-2xl mx-auto">
          <input
            type="text"
            className="w-full bg-mocha-base text-white placeholder-mocha-subtext0 border border-gray-600 rounded-full px-4 py-0.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            placeholder="Search Google or type a URL"
            value={addressUrl}
            onChange={(e) => setAddressUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                navigateTo(getProxyUrl(addressUrl));
              }
            }}
          />
        </div>
        {/* Right side spacer to balance the layout */}
        <div className="w-20"></div>{" "}
      </div>

      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full rounded-b-lg"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default BrowserSimulator;
