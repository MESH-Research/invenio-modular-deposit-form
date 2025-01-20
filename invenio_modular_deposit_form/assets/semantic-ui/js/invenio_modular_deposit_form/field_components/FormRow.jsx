import React, { useContext } from "react";
import { Form } from "semantic-ui-react";
import { FormUIStateContext } from "../InnerDepositForm";
import PropTypes from "prop-types";

const FormRow = ({ subsections, classnames, ...props }) => {
  return (
    <Form.Group className={classnames ? classnames : null}>
      {subsections.map(({ section, component, ...innerProps }, index) => {
        const { fieldComponents } = useContext(FormUIStateContext);
        const MyField = fieldComponents[component][0];
        return (
          <MyField
            key={index}
            {...{
              section,
              component,
              index,
              ...props,
              ...innerProps,
            }}
          />
        );
      })}
    </Form.Group>
  );
};

FormRow.propTypes = {
  subsections: PropTypes.array.isRequired,
  classnames: PropTypes.string,
};

export { FormRow };
