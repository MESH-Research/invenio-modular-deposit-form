import React from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupStore } from "@custom-test-utils/redux_store";
import { AdditionalTitlesField } from "./AdditionalTitlesField";
import { renderWithFormik, setupFormMocks } from "@custom-test-utils/formik_test_utils";
import axios from "axios";
import { Provider } from "react-redux";
import { useFormikContext } from "formik";

const typeOptions = {
  type: [
    { text: "Alternative title", value: "alternative-title" },
    { text: "Primary title, html stripped", value: "primary-stripped" },
    { text: "Subtitle", value: "subtitle" },
    { text: "Translated title", value: "translated-title" },
    { text: "Other", value: "other" },
  ],
};

describe("AdditionalTitlesField", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: { hits: { hits: [] } },
    });

    store = setupStore({
      deposit: {
        record: {
          ui: {
            additional_titles: [],
          },
        },
      },
    });
  });

  /**
   * @param {Array} recordOptions - Redux `deposit.record.ui.additional_titles`
   * @param {Array} formOptions - Formik `metadata.additional_titles`
   * @param {Object|null} formikUi - Optional Formik `ui` shadow (e.g. language labels)
   */
  const renderComponent = (recordOptions = [], formOptions = [], formikUi = null) => {
    const formikValuesRef = { current: null };
    const TestComponent = () => {
      const { values } = useFormikContext();
      formikValuesRef.current = values;
      return null;
    };

    const preloadedState = {
      deposit: {
        record: {
          ui: {
            additional_titles: recordOptions,
          },
        },
      },
    };

    const formMocks = setupFormMocks({
      metadata: {
        additional_titles: formOptions,
      },
      ...(formikUi ? { ui: formikUi } : {}),
    });

    store = setupStore(preloadedState);

    const result = renderWithFormik(
      <Provider store={store}>
        <AdditionalTitlesField
          fieldPath="metadata.additional_titles"
          options={typeOptions}
          recordUI={store.getState().deposit.record.ui}
        />
        <TestComponent />
      </Provider>,
      {
        initialValues: formMocks.values,
      }
    );

    return { ...result, formikValues: formikValuesRef };
  };

  it("renders empty state with a single Add titles control", () => {
    renderComponent();

    expect(screen.getByText("Add titles")).toBeInTheDocument();
    expect(screen.queryByLabelText("Additional title")).not.toBeInTheDocument();
  });

  it("renders rows for existing titles (label is always Additional title)", () => {
    const formOptions = [
      {
        title: "Title 1",
        type: "translated-title",
        lang: "eng",
      },
      {
        title: "Title 2",
        type: "alternative-title",
        lang: "",
      },
    ];
    const recordOptions = [
      {
        title: "Title 1",
        type: "translated-title",
        lang: { id: "eng", title_l10n: "English" },
      },
      {
        title: "Title 2",
        type: "alternative-title",
      },
    ];
    renderComponent(recordOptions, formOptions);

    const titleFields = screen.getAllByLabelText("Additional title");
    expect(titleFields).toHaveLength(2);
    expect(titleFields[0]).toHaveValue("Title 1");
    expect(titleFields[1]).toHaveValue("Title 2");
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("prefers Formik ui.* language labels over recordUI", () => {
    const formOptions = [
      {
        title: "Title 1",
        type: "alternative-title",
        lang: "eng",
      },
    ];
    // Stale server UI would show French; restored ui shadow should win.
    const recordOptions = [
      {
        title: "Title 1",
        type: "alternative-title",
        lang: { id: "eng", title_l10n: "French" },
      },
    ];
    const formikUi = {
      metadata: {
        additional_titles: {
          0: {
            lang: [{ id: "eng", title_l10n: "English" }],
          },
        },
      },
    };
    renderComponent(recordOptions, formOptions, formikUi);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.queryByText("French")).not.toBeInTheDocument();
  });

  it("adds a new title (default alternative-title) and updates the title subfield", async () => {
    const { formikValues } = renderComponent();

    userEvent.click(screen.getByText("Add titles"));

    const titleInput = await screen.findByLabelText("Additional title");
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();

    // Language dropdown id comes from SelectField / LanguagesField fieldPath.
    const languageSelector = document.getElementById(
      "metadata.additional_titles.0.lang"
    );
    expect(languageSelector).toBeInTheDocument();

    userEvent.type(titleInput, "My Additional Title");

    await waitFor(() => {
      expect(formikValues.current.metadata.additional_titles).toHaveLength(1);
      expect(formikValues.current.metadata.additional_titles[0]).toEqual(
        expect.objectContaining({
          title: "My Additional Title",
          type: "alternative-title",
          lang: "",
        })
      );
    });
  });

  it("removes a title when clicking remove", async () => {
    const { formikValues } = renderComponent();

    userEvent.click(screen.getByText("Add titles"));
    expect(await screen.findByLabelText("Additional title")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /remove field/i }));

    await waitFor(() => {
      expect(screen.queryByLabelText("Additional title")).not.toBeInTheDocument();
      expect(formikValues.current.metadata.additional_titles).toHaveLength(0);
    });
  });

  it("handles language selection and writes string id plus ui.* label mirror", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        hits: {
          hits: [{ id: "eng", title_l10n: "English" }],
        },
      },
    });

    const { formikValues } = renderComponent();

    userEvent.click(screen.getByText("Add titles"));

    const languageSelector = document.getElementById(
      "metadata.additional_titles.0.lang"
    );
    expect(languageSelector).toBeInTheDocument();

    userEvent.type(languageSelector, "english");

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/vocabularies/languages",
        expect.objectContaining({
          headers: {
            Accept: "application/vnd.inveniordm.v1+json",
          },
          params: expect.objectContaining({
            suggest: "english",
            size: 20,
          }),
        })
      );
    });

    const englishOption = await screen.findByRole("option", { name: "English" });
    userEvent.click(englishOption);

    const selectedLabel = within(languageSelector).getByRole("alert");
    expect(selectedLabel).toHaveTextContent("English");
    expect(englishOption).toHaveClass("selected");

    await waitFor(() => {
      expect(languageSelector).toHaveAttribute("aria-expanded", "false");
      expect(formikValues.current.metadata.additional_titles).toHaveLength(1);
      expect(formikValues.current.metadata.additional_titles[0].lang).toBe("eng");
      expect(formikValues.current.ui.metadata.additional_titles[0].lang).toEqual([
        { id: "eng", title_l10n: "English" },
      ]);
    });
  });

  it("handles type selection without changing the title field label", async () => {
    const { formikValues } = renderComponent();

    userEvent.click(screen.getByText("Add titles"));

    const typeDropdown = screen.getByLabelText("Type");
    userEvent.click(typeDropdown);

    const translatedOption = screen.getByRole("option", { name: "Translated title" });
    userEvent.click(translatedOption);

    expect(within(typeDropdown).getByRole("alert")).toHaveTextContent(
      "Translated title"
    );
    // Modular field always labels the text input "Additional title".
    expect(screen.getByLabelText("Additional title")).toBeInTheDocument();
    expect(translatedOption).toHaveClass("selected");

    await waitFor(() => {
      expect(typeDropdown).toHaveAttribute("aria-expanded", "false");
      expect(formikValues.current.metadata.additional_titles).toHaveLength(1);
      expect(formikValues.current.metadata.additional_titles[0].type).toBe(
        "translated-title"
      );
    });
  });
});
