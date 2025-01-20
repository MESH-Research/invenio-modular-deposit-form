import { render } from "@testing-library/react";
import { DescriptionsComponent } from "./field_components";

describe("DescriptionsComponent", () => {
  test("renders", () => {
    const { getByTestId } = render(<DescriptionsComponent />);
    expect(getByTestId("metadata.description-field")).toBeInTheDocument();
  });
});
