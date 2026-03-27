// Jest test suite for utils.js
// File resides next to the implementation.

jest.mock('./readableFieldLabels.js', () => ({
  readableFieldLabels: {
    'metadata.title': 'Title',
    'metadata.creators': 'Creators',
    'custom': 'Custom field',
  },
}));

import {
  areDeeplyEqual,
  collectLeafFieldPathsUnderRoot,
  filterNestedObject,
  findPageIdContainingComponent,
  flattenKeysDotJoined,
  focusFirstElement,
  getErrorParent,
  getReadableFields,
  getTouchedParent,
  getVisibleFormPages,
  isNearViewportBottom,
  mergeNestedObjects,
  moveToArrayStart,
  pushToArrayEnd,
  scrollTop,
} from './utils.js';

describe('filterNestedObject', () => {
  const errors = {
    A: { b: [{ c: 'foo' }], x: 'err' },
    B: { y: 'bar' },
    C: { d: { e: 'baz' } },
  };

  test('keeps only whitelisted top level paths', () => {
    const result = filterNestedObject(errors, ['A']);
    expect(result).toEqual({ A: { b: [{ c: 'foo' }], x: 'err' } });
  });

  test('keeps array of objects when parent path is allowed', () => {
    const result = filterNestedObject(errors, ['A.b']);
    expect(result).toEqual({ A: { b: [{ c: 'foo' }] } });
  });

  test('keeps deep property inside array when the exact path is allowed', () => {
    const result = filterNestedObject(errors, ['A.b.c']);
    expect(result).toEqual({ A: { b: [{ c: 'foo' }] } });
  });

  test('keeps nested object when its path is whitelisted', () => {
    const result = filterNestedObject(errors, ['C.d']);
    expect(result).toEqual({ C: { d: { e: 'baz' } } });
  });

  test('returns empty object when nothing matches', () => {
    const result = filterNestedObject(errors, ['Z']);
    expect(result).toEqual({});
  });
});

describe('areDeeplyEqual', () => {
  test('returns true for identical primitives', () => {
    expect(areDeeplyEqual(1, 1, [])).toBe(true);
    expect(areDeeplyEqual('a', 'a', [])).toBe(true);
    expect(areDeeplyEqual(null, null, [])).toBe(true);
  });

  test('returns false for different primitives', () => {
    expect(areDeeplyEqual(1, 2, [])).toBe(false);
    expect(areDeeplyEqual('a', 'b', [])).toBe(false);
    expect(areDeeplyEqual(null, {}, [])).toBe(false);
  });

  test('returns true for deeply equal objects', () => {
    const a = { x: 1, y: { z: 2 } };
    const b = { x: 1, y: { z: 2 } };
    expect(areDeeplyEqual(a, b, [])).toBe(true);
  });

  test('returns false when object keys differ', () => {
    expect(areDeeplyEqual({ a: 1 }, { a: 1, b: 2 }, [])).toBe(false);
    expect(areDeeplyEqual({ a: 1, b: 2 }, { a: 1 }, [])).toBe(false);
  });

  test('returns false when nested values differ', () => {
    expect(areDeeplyEqual({ a: { b: 1 } }, { a: { b: 2 } }, [])).toBe(false);
  });

  test('ignores top-level keys when listed in ignoreKeys', () => {
    const a = { skip: 99, keep: 1 };
    const b = { skip: 0, keep: 1 };
    expect(areDeeplyEqual(a, b, ['skip'])).toBe(true);
  });

  test('ignores nested paths when listed in ignoreKeys', () => {
    const a = { meta: { updated: 'a', id: 1 } };
    const b = { meta: { updated: 'b', id: 1 } };
    expect(areDeeplyEqual(a, b, ['meta.updated'])).toBe(true);
  });
});

describe('findPageIdContainingComponent', () => {
  test('returns page section id when component found in page', () => {
    const formPages = [
      { section: 'page-1', subsections: [{ component: 'Other' }] },
      { section: 'page-6', subsections: [{ component: 'FileUploadComponent' }] },
    ];
    expect(findPageIdContainingComponent(formPages, 'FileUploadComponent')).toBe('page-6');
  });

  test('returns null when component not found', () => {
    const formPages = [
      { section: 'page-1', subsections: [{ component: 'Other' }] },
    ];
    expect(findPageIdContainingComponent(formPages, 'FileUploadComponent')).toBe(null);
  });

  test('finds component in nested subsections', () => {
    const formPages = [
      {
        section: 'page-1',
        subsections: [
          {
            subsections: [{ component: 'FileUploadComponent' }],
          },
        ],
      },
    ];
    expect(findPageIdContainingComponent(formPages, 'FileUploadComponent')).toBe('page-1');
  });

  test('returns null for invalid inputs', () => {
    expect(findPageIdContainingComponent(null, 'X')).toBe(null);
    expect(findPageIdContainingComponent([], 'X')).toBe(null);
    expect(findPageIdContainingComponent([{ section: 'p' }], '')).toBe(null);
  });
});

describe('getVisibleFormPages', () => {
  const formPages = [
    {
      section: 'page-a',
      label: 'A',
      subsections: [{ section: 's1', component: 'TitlesComponent' }],
    },
    { section: 'page-b', label: 'B', subsections: [] },
    { section: 'page-c', label: 'C', subsections: [] },
  ];

  test('drops pages with empty merged subsections', () => {
    const visible = getVisibleFormPages(formPages, {}, {});
    expect(visible.map((p) => p.section)).toEqual(['page-a']);
  });

  test('includes page when type override adds subsections to empty common page', () => {
    const typeFields = {
      'page-b': [{ section: 'x', component: 'AbstractComponent' }],
    };
    const visible = getVisibleFormPages(formPages, typeFields, {});
    expect(visible.map((p) => p.section)).toEqual(['page-a', 'page-b']);
  });

  test('respects same_as for empty common page', () => {
    const fieldsByType = {
      template: {
        'page-c': [{ section: 'y', component: 'TitlesComponent' }],
      },
    };
    const typeFields = {
      'page-c': [{ same_as: 'template' }],
    };
    const visible = getVisibleFormPages(formPages, typeFields, fieldsByType);
    expect(visible.map((p) => p.section)).toEqual(['page-a', 'page-c']);
  });
});

describe('flattenKeysDotJoined', () => {
  test('returns top-level keys for flat object', () => {
    expect(flattenKeysDotJoined({ a: 1, b: 2 })).toEqual(['a', 'b']);
  });

  test('returns dot-joined paths for nested object', () => {
    const obj = { a: { b: 1, c: 2 } };
    expect(flattenKeysDotJoined(obj)).toEqual(['a.b', 'a.c']);
  });

  test('handles deep nesting', () => {
    const obj = { a: { b: { c: 1 } } };
    expect(flattenKeysDotJoined(obj)).toEqual(['a.b.c']);
  });

  test('does not recurse into arrays', () => {
    const obj = { a: [1, 2] };
    expect(flattenKeysDotJoined(obj)).toEqual(['a']);
  });
});

describe('getTouchedParent', () => {
  test('returns false when no ancestor path is in touched', () => {
    const touched = { other: true };
    expect(getTouchedParent(touched, 'metadata.title')).toBe(false);
  });

  test('returns true when parent path is touched', () => {
    const touched = { metadata: { title: true } };
    expect(getTouchedParent(touched, 'metadata.title')).toBe(true);
  });

  test('returns true when grandparent path is touched', () => {
    const touched = { metadata: { creators: true } };
    expect(getTouchedParent(touched, 'metadata.creators.0.name')).toBe(true);
  });

  test('returns true when root `files` is touched but not `files.enabled` (nested error path)', () => {
    const touched = { files: true };
    expect(getTouchedParent(touched, 'files.enabled')).toBe(true);
  });
});

describe('getErrorParent', () => {
  test('returns false when no ancestor has error', () => {
    const errors = { other: 'err' };
    expect(getErrorParent(errors, 'metadata.title')).toBe(false);
  });

  test('returns true when parent path has error', () => {
    const errors = { metadata: { title: 'Required' } };
    expect(getErrorParent(errors, 'metadata.title')).toBe(true);
  });

  test('returns true when nested path has error', () => {
    const errors = { metadata: { creators: 'Invalid' } };
    expect(getErrorParent(errors, 'metadata.creators.0.name')).toBe(true);
  });
});

describe('getReadableFields', () => {
  test('splits fields with and without array brackets', () => {
    const fields = ['metadata.title', 'metadata.creators[0].name'];
    const [without, withArrays] = getReadableFields(fields);
    expect(without).toEqual(['Title']);
    expect(withArrays).toEqual(['Creators']);
  });

  test('uses label from readableFieldLabels when present', () => {
    const fields = ['metadata.title'];
    const [readable] = getReadableFields(fields);
    expect(readable).toEqual(['Title']);
  });

  test('falls back to field path when no label', () => {
    const fields = ['unknown.field'];
    const [readable] = getReadableFields(fields);
    expect(readable).toEqual(['unknown.field']);
  });
});

describe('isNearViewportBottom', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });

  test('returns true when element bottom is at or past viewport bottom', () => {
    const el = { getBoundingClientRect: () => ({ bottom: 800 }) };
    expect(isNearViewportBottom(el)).toBe(true);
  });

  test('returns false when element is above viewport bottom', () => {
    const el = { getBoundingClientRect: () => ({ bottom: 400 }) };
    expect(isNearViewportBottom(el)).toBe(false);
  });

  test('applies offset to bottom', () => {
    const el = { getBoundingClientRect: () => ({ bottom: 750 }) };
    expect(isNearViewportBottom(el, 100)).toBe(true);
    expect(isNearViewportBottom(el, 0)).toBe(false);
  });
});

describe('mergeNestedObjects', () => {
  test('merges plain objects with A taking priority', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 3, z: 4 };
    expect(mergeNestedObjects(a, b)).toEqual({ x: 1, y: 2, z: 4 });
  });

  test('concatenates arrays by default', () => {
    const a = [1, 2];
    const b = [3];
    expect(mergeNestedObjects(a, b)).toEqual([1, 2, 3]);
  });

  test('dedup strategy removes duplicates', () => {
    const a = [1, 2];
    const b = [2, 3];
    expect(mergeNestedObjects(a, b, 'dedup')).toEqual([1, 2, 3]);
  });

  test('override strategy keeps only objA array', () => {
    const a = [1, 2];
    const b = [3, 4];
    expect(mergeNestedObjects(a, b, 'override')).toEqual([1, 2]);
  });

  test('recursively merges nested objects', () => {
    const a = { meta: { a: 1, b: 2 } };
    const b = { meta: { b: 3, c: 4 } };
    expect(mergeNestedObjects(a, b)).toEqual({ meta: { a: 1, b: 2, c: 4 } });
  });

  test('returns the other when one is null/undefined (avoids Object.keys throw)', () => {
    expect(mergeNestedObjects(null, null)).toBe(null);
    expect(mergeNestedObjects(undefined, { x: 1 })).toEqual({ x: 1 });
    expect(mergeNestedObjects({ a: 1 }, null)).toEqual({ a: 1 });
  });
});

describe('moveToArrayStart', () => {
  test('moves single item to start by key', () => {
    const arr = [
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'c', v: 3 },
    ];
    expect(moveToArrayStart(arr, ['c'], 'id')).toEqual([
      { id: 'c', v: 3 },
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
    ]);
  });

  test('moves multiple targets to start in order', () => {
    const arr = [
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'c', v: 3 },
    ];
    expect(moveToArrayStart(arr, ['c', 'a'], 'id')).toEqual([
      { id: 'a', v: 1 },
      { id: 'c', v: 3 },
      { id: 'b', v: 2 },
    ]);
  });

  test('does not mutate original array', () => {
    const arr = [{ id: 'a' }, { id: 'b' }];
    moveToArrayStart(arr, ['b'], 'id');
    expect(arr[0].id).toBe('a');
  });
});

describe('pushToArrayEnd', () => {
  test('moves item matching key to end', () => {
    const arr = [
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
      { id: 'c', v: 3 },
    ];
    expect(pushToArrayEnd(arr, 'b', 'id')).toEqual([
      { id: 'a', v: 1 },
      { id: 'c', v: 3 },
      { id: 'b', v: 2 },
    ]);
  });

  test('does not mutate original array', () => {
    const arr = [{ id: 'a' }, { id: 'b' }];
    pushToArrayEnd(arr, 'a', 'id');
    expect(arr[0].id).toBe('a');
  });
});

describe('scrollTop', () => {
  test('calls window.scrollTo with top 0 and smooth behavior', () => {
    const scrollTo = jest.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    scrollTop();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });
});

describe('focusFirstElement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('focuses first focusable element and scrolls to top after timeout', () => {
    const focus = jest.fn();
    const scrollTo = jest.fn();
    const input0 = { focus };
    const querySelectorAll = jest.fn(() => [input0]);
    Object.defineProperty(document, 'querySelectorAll', { value: querySelectorAll, writable: true });
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });

    focusFirstElement('page-1', true, null);
    jest.advanceTimersByTime(100);

    expect(querySelectorAll).toHaveBeenCalledWith(
      '#InvenioAppRdm\\.Deposit\\.FormPage\\.page-1 button, #InvenioAppRdm\\.Deposit\\.FormPage\\.page-1 input, #InvenioAppRdm\\.Deposit\\.FormPage\\.page-1 .selection.dropdown input'
    );
    expect(focus).toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('when recoveryAsked is false, does not focus', () => {
    const querySelectorAll = jest.fn(() => [{ focus: jest.fn() }]);
    Object.defineProperty(document, 'querySelectorAll', { value: querySelectorAll, writable: true });

    focusFirstElement('page-1', false);
    jest.advanceTimersByTime(100);

    expect(querySelectorAll).not.toHaveBeenCalled();
  });

  test('on file upload page focuses second element when fileUploadPageId matches', () => {
    const focus0 = jest.fn();
    const focus1 = jest.fn();
    const querySelectorAll = jest.fn(() => [{ focus: focus0 }, { focus: focus1 }]);
    Object.defineProperty(document, 'querySelectorAll', { value: querySelectorAll, writable: true });

    focusFirstElement('page-6', true, 'page-6');
    jest.advanceTimersByTime(100);

    expect(focus0).not.toHaveBeenCalled();
    expect(focus1).toHaveBeenCalled();
  });
});

describe('collectLeafFieldPathsUnderRoot', () => {
  test('returns leaf paths for array of objects', () => {
    const value = [{ title: '', type: 'other', lang: 'en' }];
    expect(collectLeafFieldPathsUnderRoot('metadata.additional_titles', value)).toEqual([
      'metadata.additional_titles.0.title',
      'metadata.additional_titles.0.type',
      'metadata.additional_titles.0.lang',
    ]);
  });

  test('empty array returns no paths', () => {
    expect(collectLeafFieldPathsUnderRoot('metadata.additional_titles', [])).toEqual([]);
  });

  test('primitive returns single path', () => {
    expect(collectLeafFieldPathsUnderRoot('metadata.title', 'x')).toEqual(['metadata.title']);
  });

  test('null returns no paths', () => {
    expect(collectLeafFieldPathsUnderRoot('metadata.foo', null)).toEqual([]);
  });
});
