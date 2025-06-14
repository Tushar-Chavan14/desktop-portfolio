"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-6 max-w-2xl w-full">
        {/* Terminal-like header */}
        <div className="flex items-center mb-4 pb-2 border-b border-gray-600">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="ml-4 text-gray-300 text-sm font-mono">
            Terminal - Error Handler
          </span>
        </div>

        {/* Cowsay penguin */}
        <div className="bg-black rounded p-4 mb-6 font-mono text-green-400 text-sm overflow-x-auto">
          <pre>{`
 _________________________________
< Oops! Something went wrong in   >
< your portfolio. Don't worry,    >
< even penguins have bad days!    >
 ---------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||

    🐧 Error: ${error.message || "Unknown error occurred"}
    
    Stack trace logged to console for debugging.
          `}</pre>
        </div>

        {/* Error details card */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-orange-400 font-semibold mb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            System Error Report
          </h3>
          <div className="text-gray-300 text-sm">
            <p>
              <strong>Process:</strong> Portfolio Application
            </p>
            <p>
              <strong>Status:</strong> Crashed
            </p>
            <p>
              <strong>Error ID:</strong> {error.digest || "N/A"}
            </p>
            <p>
              <strong>Suggestion:</strong> Try refreshing or contact system
              administrator
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restart Application
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              />
            </svg>
            Force Reload
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">
            💻 Tusar's Portfolio • Built with Next.js • 🐧 Gnome Desktop
            Inspired
          </p>
        </div>
      </div>
    </div>
  );
}
