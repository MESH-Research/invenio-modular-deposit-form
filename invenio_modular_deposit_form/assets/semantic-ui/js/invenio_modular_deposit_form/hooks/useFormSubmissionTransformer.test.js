import { useFormSubmissionTransformer } from './FormSubmissionTransformer';
import { setupStore } from '@custom-test-utils/redux_store';
import { setupFormMocks } from '@custom-test-utils/formik_test_utils';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import React from 'react';

// Mock the formik and redux hooks
jest.mock('formik', () => ({
  useFormikContext: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useStore: jest.fn(),
}));

describe('useFormSubmissionTransformer', () => {
  let mockStore;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock store
    mockStore = setupStore({
      files: {
        entries: {
          'test.pdf': {
            key: 'test.pdf',
            mimetype: 'application/pdf',
            size: '17181',
          },
        },
      },
    });

    require('react-redux').useStore.mockReturnValue(mockStore);
  });

  const TestComponent = () => {
    useFormSubmissionTransformer();
    return null;
  };

  const renderHook = () => {
    render(<TestComponent />);
  };

  it('should filter empty identifiers', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      metadata: {
        identifiers: [
          { identifier: '', scheme: '' },
          { identifier: '123', scheme: 'doi' },
          { identifier: '', scheme: 'orcid' },
        ],
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    act(() => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).toHaveBeenCalledWith(
      'metadata.identifiers',
      [{ identifier: '123', scheme: 'doi' }]
    );
  });

  it('should set default publisher if empty', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      metadata: {
        publisher: '',
        identifiers: [],
      },
      files: {
        enabled: false,
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    await act(async () => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).toHaveBeenCalledWith(
      'metadata.publisher',
      'Knowledge Commons'
    );
  });

  it('should not change non-empty publisher', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      metadata: {
        publisher: 'Test Publisher',
        identifiers: [],
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    act(() => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).not.toHaveBeenCalledWith(
      'metadata.publisher',
      expect.anything()
    );
  });

  it('should fix ORCID URL format', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      metadata: {
        identifiers: [
          { identifier: 'https://orcid.org/0000-0001-2345-6789', scheme: 'orcid' },
          { identifier: '123', scheme: 'doi' },
        ],
      },
      files: {
        enabled: false,
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    await act(async () => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).toHaveBeenCalledWith(
      'metadata.identifiers',
      [
        { identifier: '123', scheme: 'doi' },
        { identifier: '0000-0001-2345-6789', scheme: 'orcid' },
      ]
    );
  });

  it('should enable files when files exist but are not enabled', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      metadata: {
        publisher: 'Test Publisher',
        identifiers: [],
      },
      files: {
        enabled: false,
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    await act(async () => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).toHaveBeenCalledWith(
      'files.enabled',
      true
    );
  });

  it('should not enable files when files are already enabled', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      files: {
        enabled: true,
      },
    });

    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    act(() => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).not.toHaveBeenCalledWith(
      'files.enabled',
      expect.anything()
    );
  });

  it('should not enable files when no files exist', async () => {
    // Setup test data
    const { values, setFieldValue } = setupFormMocks({
      files: {
        enabled: false,
      },
    });

    // Mock store with no files
    mockStore = setupStore({
      files: {
        entries: {},
      },
    });

    require('react-redux').useStore.mockReturnValue(mockStore);
    require('formik').useFormikContext.mockReturnValue({
      values,
      setFieldValue,
    });

    // Call the hook
    act(() => {
      renderHook();
    });

    // Verify results
    expect(setFieldValue).not.toHaveBeenCalledWith(
      'files.enabled',
      expect.anything()
    );
  });
});
