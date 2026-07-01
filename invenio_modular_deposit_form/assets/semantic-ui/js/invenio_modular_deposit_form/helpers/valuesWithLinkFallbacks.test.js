import { valuesWithLinkFallbacks } from "./valuesWithLinkFallbacks";

const FORMik_LINKS = { self: "https://example.org/api/records/abc/draft", reserve_doi: "https://example.org/api/records/abc/draft/pids/doi" };
const REDUX_LINKS = { self: "https://example.org/api/records/redux/draft" };
const INITIAL_LINKS = { self: "https://example.org/api/records/initial/draft" };

describe("valuesWithLinkFallbacks", () => {
  it("returns the same object reference when Formik links are usable", () => {
    const values = { id: "abc", links: FORMik_LINKS, metadata: { title: "T" } };
    expect(valuesWithLinkFallbacks(values, { recordLinks: REDUX_LINKS })).toBe(values);
  });

  it("uses Redux links when Formik links are missing", () => {
    const values = { id: "abc", metadata: { title: "T" } };
    expect(
      valuesWithLinkFallbacks(values, {
        recordLinks: REDUX_LINKS,
        initialValuesLinks: INITIAL_LINKS,
      })
    ).toEqual({ ...values, links: REDUX_LINKS });
  });

  it("uses initialValues links when Formik and Redux links are missing", () => {
    const values = { id: "abc", links: undefined };
    expect(
      valuesWithLinkFallbacks(values, {
        recordLinks: undefined,
        initialValuesLinks: INITIAL_LINKS,
      })
    ).toEqual({ ...values, links: INITIAL_LINKS });
  });

  it("prefers Redux over initialValues when both are usable", () => {
    const values = { id: "abc" };
    expect(
      valuesWithLinkFallbacks(values, {
        recordLinks: REDUX_LINKS,
        initialValuesLinks: INITIAL_LINKS,
      })
    ).toEqual({ ...values, links: REDUX_LINKS });
  });

  it("falls back through unusable link objects to the next source", () => {
    const values = { id: "abc", links: {} };
    expect(
      valuesWithLinkFallbacks(values, {
        recordLinks: { reserve_doi: "https://example.org/reserve" },
        initialValuesLinks: INITIAL_LINKS,
      })
    ).toEqual({ ...values, links: INITIAL_LINKS });
  });
});
