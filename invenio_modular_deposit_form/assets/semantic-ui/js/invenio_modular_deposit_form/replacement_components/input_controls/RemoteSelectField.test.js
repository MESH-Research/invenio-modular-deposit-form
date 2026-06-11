// Jest test suite for the two-phase parallel render added to RemoteSelectField via the
// optional `mergeExtraSource` prop. Tests target the `executeSearch` method directly via
// a callback ref so they don't depend on Semantic UI dropdown rendering or simulated user
// typing — the new behavior is entirely about how `state.suggestions` and `state.isFetching`
// transition as the local API and extra-source promises resolve.

import React from "react";
import axios from "axios";
import { renderWithFormik } from "@custom-test-utils/formik_test_utils";
import { RemoteSelectField } from "./RemoteSelectField";

// A controlled promise we can resolve/reject from outside, so the test drives the timing
// of phase 1 (local) and phase 2 (extra source) independently.
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

// Identity serializer so assertions can compare the raw hit objects directly.
const passthroughSerialize = (hits) =>
  (hits || []).map((h) => ({ ...h, value: h.id, key: h.id, text: h.id }));

// Mount RemoteSelectField with a Formik wrapper and a callback ref that resolves once
// the instance is available. Returns the instance plus an unmount handle.
const mountField = async (extraProps = {}) => {
  let instance = null;
  const refReady = deferred();
  const captureRef = (ref) => {
    if (ref) {
      instance = ref;
      refReady.resolve(ref);
    }
  };
  const utils = renderWithFormik(
    <RemoteSelectField
      fieldPath="testField"
      suggestionAPIUrl="/api/test"
      serializeSuggestions={passthroughSerialize}
      ref={captureRef}
      debounceTime={0}
      {...extraProps}
    />,
    { initialValues: {} }
  );
  await refReady.promise;
  return { instance, utils };
};

// Microtask-flush helper: lets pending Promise.then callbacks (and the resulting setState
// scheduling) settle before assertions. Two ticks to cover chained .then(setState).
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("RemoteSelectField executeSearch", () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("without mergeExtraSource (baseline)", () => {
    test("paints local hits and ends with isFetching=false", async () => {
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "local-1" }, { id: "local-2" }] } },
      });

      const { instance } = await mountField();
      await instance.executeSearch("alice");

      expect(instance.state.isFetching).toBe(false);
      expect(instance.state.suggestions).toHaveLength(2);
      expect(instance.state.suggestions.map((s) => s.id)).toEqual([
        "local-1",
        "local-2",
      ]);
    });
  });

  describe("with mergeExtraSource (two-phase parallel render)", () => {
    test("paints local hits first; spinner stays on; extras merge in afterward", async () => {
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "local-1" }] } },
      });
      const extras = deferred();
      const mergeExtraSource = jest.fn(() => extras.promise);

      const { instance } = await mountField({ mergeExtraSource });

      // Kick off but don't await; we want to inspect intermediate state.
      const searchDone = instance.executeSearch("alice");

      // Phase 1: local resolves (axios mock is synchronous-resolved).
      await flush();
      expect(instance.state.suggestions.map((s) => s.id)).toEqual(["local-1"]);
      // Spinner must stay on because extras are still pending.
      expect(instance.state.isFetching).toBe(true);
      expect(mergeExtraSource).toHaveBeenCalledTimes(1);

      // Phase 2: extras resolve.
      extras.resolve([{ id: "orcid:abc" }]);
      await searchDone;

      expect(instance.state.isFetching).toBe(false);
      expect(instance.state.suggestions.map((s) => s.id)).toEqual([
        "local-1",
        "orcid:abc",
      ]);
    });

    test("invokes mergeExtraSource with a Promise of local hits and the query string", async () => {
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "local-1" }] } },
      });
      const mergeExtraSource = jest.fn(() => Promise.resolve([]));

      const { instance } = await mountField({ mergeExtraSource });
      await instance.executeSearch("alice");

      expect(mergeExtraSource).toHaveBeenCalledTimes(1);
      const [localPromiseArg, queryArg] = mergeExtraSource.mock.calls[0];
      expect(typeof localPromiseArg.then).toBe("function");
      expect(queryArg).toBe("alice");
      // The promise the helper received resolves to the local hits — not undefined.
      await expect(localPromiseArg).resolves.toEqual([{ id: "local-1" }]);
    });

    test("rejection from mergeExtraSource is swallowed; local hits still render; isFetching ends false", async () => {
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "local-1" }] } },
      });
      const mergeExtraSource = jest.fn(() =>
        Promise.reject(new Error("ORCID down"))
      );

      const { instance } = await mountField({ mergeExtraSource });
      await instance.executeSearch("alice");

      expect(instance.state.isFetching).toBe(false);
      expect(instance.state.error).toBe(false);
      expect(instance.state.suggestions.map((s) => s.id)).toEqual(["local-1"]);
    });

    test("late extras for a superseded query are dropped (staleness guard)", async () => {
      // First call: local resolves to [a-local]; extras held open.
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "a-local" }] } },
      });
      const firstExtras = deferred();
      // Second call: local + extras both resolve immediately to [b-local], [b-orcid].
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "b-local" }] } },
      });
      const secondExtras = Promise.resolve([{ id: "b-orcid" }]);

      const mergeExtraSource = jest
        .fn()
        .mockReturnValueOnce(firstExtras.promise)
        .mockReturnValueOnce(secondExtras);

      const { instance } = await mountField({ mergeExtraSource });

      // Start first search; let phase 1 paint a-local.
      const firstDone = instance.executeSearch("alice");
      await flush();
      expect(instance.state.suggestions.map((s) => s.id)).toEqual(["a-local"]);

      // Start second search; phase 1 + 2 both complete because secondExtras is already resolved.
      const secondDone = instance.executeSearch("alicia");
      await secondDone;
      expect(instance.state.searchQuery).toBe("alicia");
      expect(instance.state.suggestions.map((s) => s.id).sort()).toEqual([
        "b-local",
        "b-orcid",
      ]);
      expect(instance.state.isFetching).toBe(false);

      // Now resolve the FIRST search's stale extras. They must be dropped.
      firstExtras.resolve([{ id: "a-orcid" }]);
      await firstDone;

      // a-orcid must NOT have leaked into the dropdown for the current "alicia" query.
      expect(instance.state.suggestions.map((s) => s.id)).not.toContain("a-orcid");
      expect(instance.state.suggestions.map((s) => s.id).sort()).toEqual([
        "b-local",
        "b-orcid",
      ]);
    });

    test("does not call mergeExtraSource if the query is unchanged from the previous search", async () => {
      axios.get.mockResolvedValueOnce({
        data: { hits: { hits: [{ id: "local-1" }] } },
      });
      const mergeExtraSource = jest.fn(() => Promise.resolve([]));

      const { instance } = await mountField({ mergeExtraSource });
      await instance.executeSearch("alice");
      await instance.executeSearch("alice");

      expect(mergeExtraSource).toHaveBeenCalledTimes(1);
    });
  });
});
