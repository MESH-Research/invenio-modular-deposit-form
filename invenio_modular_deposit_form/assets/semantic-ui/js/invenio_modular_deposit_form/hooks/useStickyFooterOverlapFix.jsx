import { useEffect } from "react";
import { isNearViewportBottom } from "@js/invenio_modular_deposit_form/utils";

function useStickyFooterOverlapFix(currentFormPage) {
  useEffect(() => {
    function handleFocus(event) {
      if (isNearViewportBottom(event.target, 100)) {
        console.log("useStickyFooterOverlapFix isNearViewportBottom", event.target);
        event.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    const inputs = document.querySelectorAll(
      "#rdm-deposit-form input, #rdm-deposit-form button:not(.back-button):not(.continue-button), #rdm-deposit-form select"
    );
    inputs.forEach((input) => {
      input.addEventListener("focus", handleFocus);
    });
    const textareas = document.querySelectorAll("#rdm-deposit-form textarea");
    textareas.forEach((textarea) => {
      textarea.addEventListener("focus", handleFocus);
    });
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
      });
      textareas.forEach((textarea) => {
        textarea.removeEventListener("focus", handleFocus);
      });
    };
  }, [currentFormPage]);
}

export { useStickyFooterOverlapFix };
