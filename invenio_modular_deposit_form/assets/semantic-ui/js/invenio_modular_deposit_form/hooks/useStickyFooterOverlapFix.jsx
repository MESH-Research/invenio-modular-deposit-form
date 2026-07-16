import { useEffect } from "react";
import { isNearViewportBottom } from "@js/invenio_modular_deposit_form/utils";

function useStickyFooterOverlapFix() {
  useEffect(() => {
    function handleFocus(event) {
      const footerHeight =
        document.getElementsByClassName("sticky-footer-fixed")[0]?.offsetHeight ?? 0;
      if (isNearViewportBottom(event.target, 100 + footerHeight)) {
        event.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    const formElement = document.querySelector("#rdm-deposit-form");
    if (formElement) {
      formElement.addEventListener("focusin", handleFocus);
      return () => {
        formElement.removeEventListener("focusin", handleFocus);
      };
    }
  }, []);
}

export { useStickyFooterOverlapFix };
