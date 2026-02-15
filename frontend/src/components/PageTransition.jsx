import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location, children]);

  return (
    <>
      {/* Modern Loading Screen */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-6">
            {/* Animated Loading Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            
            {/* Loading Text with Animation */}
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-slate-700">
                Loading
              </p>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>

            {/* Subtle progress bar */}
            <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Page Transition */}
      <div
        className={`transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {displayChildren}
      </div>
    </>
  );
};

export default PageTransition;

