import { useEffect, useState, useRef } from "react";
import { useFormikContext } from "formik";

import { areDeeplyEqual } from "../utils";

/** Custom hook for recovering form values from local storage
 *
 * @param {Object} currentUserprofile
 * @returns {Object} recoveryAsked, confirmModalRef, recoveredStorageValues, storageDataPresent
 */
function useLocalStorageRecovery(currentUserprofile) {

  const [recoveryAsked, setRecoveryAsked] = useState(false);
  const confirmModalRef = useRef();
  const [recoveredStorageValues, setRecoveredStorageValues] = useState(null);
  const [storageDataPresent, setStorageDataPresent] = useState(false);
  const { values, initialValues, setValues, setInitialValues } = useFormikContext();

  // handler for recoveryAsked
  // focus first element when modal is closed to allow keyboard navigation
  const handleRecoveryAsked = () => {
    setRecoveryAsked(true);
    focusFirstElement(currentFormPage, true, recoveryAsked);
  };

  //keep changed form values in local storage
  useEffect(() => {
    if (!!recoveryAsked && !areDeeplyEqual(initialValues, values, ["ui"])) {
      window.localStorage.setItem(
        `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`,
        JSON.stringify(values)
      );
    }
  }, [values]);

  //recover form values from local storage
  useEffect(() => {
    const user = currentUserprofile.id;
    const storageValuesKey = `rdmDepositFormValues.${user}.${initialValues?.id}`;
    const storageValues = window.localStorage.getItem(storageValuesKey);
    const storageValuesObj = JSON.parse(storageValues);
    console.log("Checking if storageValuesObj is equal to values");
    console.log("storageValuesObj:", storageValuesObj);
    console.log("values:", values);
    if (
      !recoveryAsked &&
      !!storageValuesObj &&
      !areDeeplyEqual(storageValuesObj, values, [
        "ui",
        "metadata.resource_type",
        "metadata.publication_date",
        "pids.doi",
      ])
    ) {
      console.log("setting recoveredStorageValues");
      setRecoveredStorageValues(storageValuesObj);
      setStorageDataPresent(true);
    } else {
      console.log("setting recoveryAsked to true");
      setRecoveryAsked(true);
    }
  }, []);

  const handleStorageData = (recover) => {
    if (recover) {
      console.log("recovering storage data");
      async function setinitialvalues() {
        await setValues(recoveredStorageValues, false);
        await setInitialValues(recoveredStorageValues, false);
      }
      setinitialvalues();
      setRecoveredStorageValues(null);
    }
    window.localStorage.removeItem(
      `rdmDepositFormValues.${currentUserprofile.id}.${values.id}`
    );
  };

  return { handleStorageData, storageDataPresent, recoveryAsked, confirmModalRef, handleRecoveryAsked };
}

export { useLocalStorageRecovery };
