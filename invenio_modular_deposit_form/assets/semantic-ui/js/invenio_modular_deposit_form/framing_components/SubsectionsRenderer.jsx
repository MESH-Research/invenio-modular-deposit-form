import React from "react";
import PropTypes from "prop-types";
import { SectionWrapper } from "./SectionWrapper";
import { FieldsContent } from "./FieldsContent";

/**
 * Renders a list of subsection configs (section, component, subsections, ...) using
 * the component registry. Handles SectionWrapper (with inner subsections) and
 * single field components via FieldsContent. Used by FormPage and by layout
 * regions (FormHeader, FormLeftSidebar, FormRightSidebar, FormFooter).
 * Only when isFormPagesRegion is true are top-level fields forced into a SectionWrapper.
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
        return component === "SectionWrapper" ? (
          <SectionWrapper sectionName={section} key={section} {...props}>
            {(innerSections ?? []).map(({ component: innerComponent, ...innerProps }, i) => (
              <FieldsContent
                key={i}
                section={section}
                component={innerComponent}
                wrapped={wrapped}
                index={i}
                {...innerProps}
              />
            ))}
          </SectionWrapper>
        ) : (
          <FieldsContent
            key={section ?? index}
            section={section}
            component={component}
            wrapped={isFormPagesRegion ? true : (wrapped ?? false)}
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
