import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { Button, Icon } from "semantic-ui-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormValuesContext } from "./RDMDepositForm";
import { SectionWrapper } from "./field_components/SectionWrapper";
import { initial } from "lodash";

function useIsInViewport(ref) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}

const FieldsContent = ({
  section,
  component,
  wrapped,
  index,
  commonFieldProps,
  ...props
}) => {
  const MyField = commonFieldProps.fieldComponents[component][0];
  return !!wrapped ? (
    <SectionWrapper sectionName={section}>
      <MyField key={index} {...commonFieldProps} {...props} />
    </SectionWrapper>
  ) : (
    <MyField key={index} {...commonFieldProps} {...props} />
  );
};

const FormPage = ({
  commonFieldProps,
  currentFormPage,
  pageFields,
  id,
  pageNums,
  subsections,
}) => {
  const {
    errors,
    initialErrors,
    initialTouched,
    initialValues,
    isValid,
    setFieldValue,
    setFieldTouched,
    setTouched,
    touched,
    validateField,
    validateForm,
    values,
    ...otherProps
  } = useFormikContext();
  const {
    currentValues,
    handleValuesChange,
    currentErrors,
    currentTouched,
    handleErrorsChange,
    handleFormPageChange,
  } = useContext(FormValuesContext);
  // console.log("FormPage formik errors", errors);
  // console.log("FormPage formik touched", touched);
  // console.log("FormPage formik values", values);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextPage =
    nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousPage =
    previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;
  const pageTargetRef = useRef(null);
  // FIXME: sticky footer deactivated
  // const pageTargetInViewport = useIsInViewport(pageTargetRef);

  //pass values up from Formik context to main form context
  useEffect(() => {
    if (
      !!currentValues &&
      currentValues.metadata?.resource_type !== values.metadata.resource_type
    ) {
      handleValuesChange(values);
    }
  }, [values]);

  //pass errors up from Formik context to main form context on initial render
  useEffect(() => {
    if (currentErrors !== errors) {
      handleErrorsChange(
        errors,
        touched,
        initialErrors,
        initialTouched,
        isValid
      );
    }
  }, []);

  //pass errors up from Formik context to main form context when they change
  useEffect(() => {
    console.log("errors or touched changed errors", errors);
    console.log("errors or touched changed touched", touched);
    if (currentErrors !== errors || currentTouched !== touched) {
      handleErrorsChange(
        errors,
        touched,
        initialErrors,
        initialTouched,
        isValid
      );
    }
  }, [errors, touched]);

  const handleButtonClick = (event, { value }) => {
    console.log("setting touched", touched);
    for (const field of pageFields) {
      console.log("setting field touched", field);
      setFieldTouched(field);
    }
    setTimeout(() => {
      console.log("after setting, touched is", touched);
    }, 3000);
    handleFormPageChange(event, {
      value: value,
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formPageWrapper" id={id}>
        {subsections.map(
          (
            {
              section,
              component,
              wrapped,
              subsections: innerSections,
              ...props
            },
            index
          ) => {
            return component === "SectionWrapper" ? (
              <SectionWrapper sectionName={section} key={section} {...props}>
                {innerSections.map(({ component, ...innerProps }, index) => (
                  <FieldsContent
                    key={index}
                    {...{
                      section,
                      component,
                      wrapped,
                      index,
                      commonFieldProps,
                      ...innerProps,
                    }}
                  />
                ))}
              </SectionWrapper>
            ) : (
              <FieldsContent
                {...{
                  section,
                  component,
                  wrapped,
                  index,
                  commonFieldProps,
                  ...props,
                }}
              />
            );
          }
        )}

        <div
          className={`ui container ${
            "sticky-footer-static"
            // FIXME: sticky footer deactivated
            // pageTargetInViewport
            //   ? "sticky-footer-static"
            //   : "sticky-footer-fixed"
          }`}
        >
          {!!previousPage && (
            <Button
              type="button"
              floated="left"
              onClick={handleButtonClick}
              value={previousPage}
              icon
              labelPosition="left"
            >
              <Icon name="left arrow" />
              Back
            </Button>
          )}

          {!!nextPage && (
            <Button
              primary
              type="button"
              floated="right"
              onClick={handleButtonClick}
              value={nextPage}
              icon
              labelPosition="right"
            >
              <Icon name="right arrow" />
              Continue
            </Button>
          )}
        </div>
        <div id="sticky-footer-observation-target" ref={pageTargetRef}></div>
      </div>
    </DndProvider>
  );
};

export { FieldsContent, FormPage };
