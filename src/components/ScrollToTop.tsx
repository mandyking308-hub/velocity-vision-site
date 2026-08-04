import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToLocation = () => {
      if (hash) {
        try {
          const target = document.getElementById(decodeURIComponent(hash.slice(1)));
          if (target) {
            target.scrollIntoView({ behavior: "auto", block: "start" });
            return;
          }
        } catch {
          // Ignore malformed hashes and fall back to the top of the page.
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const frame = window.requestAnimationFrame(scrollToLocation);
    const timer = window.setTimeout(scrollToLocation, 250);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
