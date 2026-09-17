import { useEffect, useState } from "react";

/**
 * Viewport intersection for a DOM node. Pass the element (e.g. from a callback ref);
 * effects do not re-run when only ref.current is assigned, so a RefObject is unreliable.
 *
 * @param {Element|null} element - DOM node to observe.
 * @param {string} [rootMargin="0px"] - IntersectionObserver `rootMargin` (e.g. `"0px 0px -5rem 0px"`).
 */
function useIsInViewport(element, rootMargin = "0px") {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!element) {
      setIsIntersecting(false);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin]);

  return isIntersecting;
}

export { useIsInViewport };
