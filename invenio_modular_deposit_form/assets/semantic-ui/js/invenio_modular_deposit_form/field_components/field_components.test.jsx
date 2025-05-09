import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupStore } from '@custom-test-utils/redux_store';
import { renderWithProviders } from '@custom-test-utils/redux_test_utils';
import { LanguagesComponent } from './field_components';
import { FormUIStateContext } from '../InnerDepositForm';
import { renderWithFormik, setupFormMocks } from '@custom-test-utils/formik_test_utils';
import axios from 'axios';
import { Provider } from 'react-redux';

// Mock axios for future API calls
jest.mock('axios');

describe('LanguagesComponent', () => {
  let store;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock axios.get to return empty results
    axios.get.mockResolvedValue({
      data: {
        hits: {
          hits: []
        }
      }
    });

    store = setupStore({
      deposit: {
        record: {
          ui: {
            languages: [],
          },
        },
      },
    });
  });

  const renderComponent = (recordOptions = [], formOptions = []) => {
    const preloadedState = {
      deposit: {
        record: {
          ui: {
            languages: recordOptions,
          },
        },
      },
    };

    const formMocks = setupFormMocks({
      metadata: {
        languages: formOptions,
      },
    });

    store = setupStore(preloadedState);

    return renderWithFormik(
      <Provider store={store}>
        <FormUIStateContext.Provider
          value={{
            vocabularies: {
              metadata: {
                languages: {
                  limit_to: [],
                },
              },
            },
            currentFieldMods: {
              defaultFieldValues: {},
              descriptionMods: {},
              helpTextMods: {},
              iconMods: {},
              labelMods: {},
              placeholderMods: {},
              priorityFieldValues: {},
              extraRequiredFields: {},
            },
          }}
        >
          <LanguagesComponent />
        </FormUIStateContext.Provider>
      </Provider>,
      {
        initialValues: formMocks.values,
      }
    );
  };

  it('should use recordOptions when formOptions contains matching string IDs', () => {
    const recordOptions = [
      { id: 'eng', title_l10n: 'English' },
      { id: 'fra', title_l10n: 'French' },
    ];
    const formOptions = ['eng', 'fra'];

    renderComponent(recordOptions, formOptions);

    // Check for the selected values in the dropdown
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();

    // Check for the selected values in the dropdown's label elements
    const englishLabel = screen.getByText('English').closest('a');
    expect(englishLabel).toHaveClass('label');
    expect(englishLabel).toHaveAttribute('value', 'eng');

    const frenchLabel = screen.getByText('French').closest('a');
    expect(frenchLabel).toHaveClass('label');
    expect(frenchLabel).toHaveAttribute('value', 'fra');
  });

  it('should use formOptions when they contain objects with id and title_l10n', () => {
    const formOptions = [
      { id: 'eng', title_l10n: 'English' },
      { id: 'fra', title_l10n: 'French' },
    ];

    renderComponent([], formOptions);

    // Check for the selected values in the dropdown
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();

    // Check for the selected values in the dropdown's label elements
    const englishLabel = screen.getByText('English').closest('a');
    expect(englishLabel).toHaveClass('label');
    expect(englishLabel).toHaveAttribute('value', 'eng');

    const frenchLabel = screen.getByText('French').closest('a');
    expect(frenchLabel).toHaveClass('label');
    expect(frenchLabel).toHaveAttribute('value', 'fra');
  });

  it('should handle empty arrays', () => {
    renderComponent([], []);
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).not.toHaveTextContent('English');
    expect(dropdown).not.toHaveTextContent('French');
  });

  it('should handle null values in formOptions', () => {
    const formOptions = [null, 'eng'];
    const recordOptions = [
      { id: 'eng', title_l10n: 'English' },
    ];
    renderComponent(recordOptions, formOptions);

    // Check for only the non-null value
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveTextContent('English');
    expect(dropdown).not.toHaveTextContent('French');
  });

  it('should search and select a language when user types and selects', async () => {
    // Mock the API response for searching "dutch"
    axios.get.mockResolvedValueOnce({
      data: {
        hits: {
          hits: [
            { id: 'dut', title_l10n: 'Dutch' }
          ]
        }
      }
    });

    renderComponent([], []);

    // Get the search input
    const searchInput = screen.getByRole('combobox');
    expect(searchInput).toBeInTheDocument();

    // Type "dutch" in the search field
    await userEvent.type(searchInput, 'dutch');

    // Wait for the API call to resolve and the dropdown to update
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/vocabularies/languages',
        expect.objectContaining({
          headers: {
            Accept: 'application/vnd.inveniordm.v1+json'
          },
          params: expect.objectContaining({
            suggest: 'dutch',
            size: 20
          })
        })
      );
    });

    // Click the "Dutch" option in the dropdown
    const dutchOption = await screen.findByText('Dutch');
    await userEvent.click(dutchOption);

    // Verify the selection was made
    const selectedLabel = screen.getByText('Dutch').closest('a');
    expect(selectedLabel).toHaveClass('label');
    expect(selectedLabel).toHaveAttribute('value', 'dut');
  });
});