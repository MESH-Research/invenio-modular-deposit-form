import { useEffect, useState } from "react";

/**
 * Viewport intersection for a DOM node. Pass the element (e.g. from a callback ref);
 * effects do not re-run when only ref.current is assigned, so a RefObject is unreliable.
 */
function useIsInViewport(element) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!element) {
      setIsIntersecting(false);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return isIntersecting;
}

export { useIsInViewport };
