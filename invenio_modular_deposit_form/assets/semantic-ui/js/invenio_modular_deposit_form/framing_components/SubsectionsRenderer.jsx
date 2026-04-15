import React from "react";
import PropTypes from "prop-types";
import { FormSection } from "./FormSection";
import { FieldsContent } from "./FieldsContent";

/**
 * Renders a list of subsection configs (section, component, subsections, ...) using
 * the component registry. Handles FormSection (with inner subsections) and
 * single field components via FieldsContent. Used by FormPage and by layout
 * regions (FormTitle, FormHeader, FormLeftSidebar, FormRightSidebar, FormFooter).
 * When `isFormPagesRegion` is true (FormPage body), top-level non-FormSection rows
 * default to `wrapped` (auto fieldset via FieldsContent → FormSection); set
 * `wrapped: false` on a row to opt out of that auto-wrap.
 */
const SubsectionsRenderer = ({ subsections = [], className, id, isFormPagesRegion = false }) => (
  <div className={className} id={id}>
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
        const isFormSection =
          component === "FormSection" || component === "SectionWrapper";
        return isFormSection ? (
          <FormSection sectionName={section} key={section} {...props}>
            {(innerSections ?? []).map(({ component: innerComponent, ...innerProps }, i) => (
              <FieldsContent
                key={i}
                section={section}
                component={innerComponent}
                wrapped={wrapped}
                index={i}
                {...innerProps}
                show_heading={innerProps.show_heading ?? props.show_heading}
              />
            ))}
          </FormSection>
        ) : (
          <FieldsContent
            key={section ?? index}
            section={section}
            component={component}
            wrapped={isFormPagesRegion ? wrapped !== false : (wrapped ?? false)}
            index={index}
            {...props}
          />
        );
      }
    )}
  </div>
);

SubsectionsRenderer.propTypes = {
  subsections: PropTypes.array,
  className: PropTypes.string,
  id: PropTypes.string,
  isFormPagesRegion: PropTypes.bool,
};

export { SubsectionsRenderer };
