import buildValidationSchema from "./validator";

describe("validator (full form validation) - pids.doi", () => {
  const schema = buildValidationSchema({});

  const baseForm = {
    access: {
      files: "public",
      record: "public",
    },
    custom_fields: {},
    metadata: {
      creators: [
        {
          person_or_org: {
            type: "personal",
            family_name: "Doe",
            given_name: "John",
          },
        },
      ],
      publication_date: "2023-01-01",
      title: "Test Title",
      resource_type: "dataset",
    },
  };

  it("accepts pids: {} (empty object)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {},
      })
    ).resolves.toBeTruthy();
  });

  it("accepts pids.doi: {} (empty placeholder object)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: { doi: {} },
      })
    ).resolves.toBeTruthy();
  });

  it("sets a string error on pids.doi when provider is external and identifier is missing (PIDSchema)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "external",
          },
        },
      })
    ).rejects.toMatchObject({ path: "pids.doi" });
  });

  it("sets a string error on pids.doi when provider is external and identifier is null", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "external",
            identifier: null,
          },
        },
      })
    ).rejects.toMatchObject({ path: "pids.doi" });
  });

  it("requires pids.doi.provider when pids.doi is present (PIDSchema)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            identifier: "10.1234/abc",
          },
        },
      })
    ).rejects.toMatchObject({ path: "pids.doi.provider" });
  });

  it("accepts non-external DOI pid with identifier + provider (PIDSchema)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "datacite",
            identifier: "10.1234/xyz",
            client: "test",
          },
        },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects invalid DOI when pids.doi.provider is external", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "external",
            identifier: "not-a-doi",
          },
        },
      })
    ).rejects.toMatchObject({ path: "pids.doi.identifier" });
  });

  it("accepts valid DOI when pids.doi.provider is external", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "external",
            identifier: "10.1234/abc",
          },
        },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects invalid ORCID on creator person_or_org.identifiers (validIdentifierForScheme)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          creators: [
            {
              person_or_org: {
                type: "personal",
                family_name: "Doe",
                given_name: "John",
                identifiers: [{ scheme: "orcid", identifier: "not-an-orcid" }],
              },
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      path: "metadata.creators[0].person_or_org.identifiers[0].identifier",
    });
  });

  it("accepts valid ORCID on creator identifiers when scheme is omitted (inferred)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          creators: [
            {
              person_or_org: {
                type: "personal",
                family_name: "Doe",
                given_name: "John",
                identifiers: [{ identifier: "0000-0001-2345-6789" }],
              },
            },
          ],
        },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects garbage creator identifier when scheme is omitted (cannot infer)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          creators: [
            {
              person_or_org: {
                type: "personal",
                family_name: "Doe",
                given_name: "John",
                identifiers: [{ identifier: "not-a-known-pid" }],
              },
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      path: "metadata.creators[0].person_or_org.identifiers[0].identifier",
    });
  });

  it("rejects invalid ORCID on contributor person_or_org.identifiers (validIdentifierForScheme)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          contributors: [
            {
              person_or_org: {
                type: "personal",
                family_name: "Doe",
                given_name: "Jane",
                identifiers: [{ scheme: "orcid", identifier: "not-an-orcid" }],
              },
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      path: "metadata.contributors[0].person_or_org.identifiers[0].identifier",
    });
  });

  it("rejects invalid record identifier on metadata.references when scheme is set", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          references: [
            {
              reference: "Some cited work",
              scheme: "doi",
              identifier: "not-a-doi",
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      path: "metadata.references[0].identifier",
    });
  });

  it("accepts metadata.references with only reference text (no PID)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          references: [{ reference: "Author (2020). Title. Journal." }],
        },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects embargo.active true without a future until (EmbargoSchema)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        access: {
          ...baseForm.access,
          embargo: { active: true, until: "2000-01-01" },
        },
      })
    ).rejects.toMatchObject({ path: "access.embargo.until" });
  });

  it("rejects embargo.active false with until in the future (EmbargoSchema)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        access: {
          ...baseForm.access,
          embargo: { active: false, until: "2099-12-31" },
        },
      })
    ).rejects.toMatchObject({ path: "access.embargo.until" });
  });

  it("accepts valid imprint ISBN and empty imprint strings", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        custom_fields: {
          "imprint:imprint": {
            title: "A Book",
            place: "",
            isbn: "978-0-262-03293-3",
            pages: "1-10",
          },
        },
      })
    ).resolves.toBeTruthy();
  });

  it("rejects invalid imprint ISBN on nested imprint:imprint object", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        custom_fields: {
          "imprint:imprint": { title: "T", isbn: "000" },
        },
      })
    ).rejects.toMatchObject({ path: "custom_fields.imprint:imprint.isbn" });
  });

  it("requires metadata.related_identifiers[].relation_type when a row is present", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          related_identifiers: [
            {
              scheme: "doi",
              identifier: "10.1234/abc",
              relation_type: "",
              resource_type: "",
            },
          ],
        },
      })
    ).rejects.toMatchObject({ path: "metadata.related_identifiers[0].relation_type" });
  });

  it("accepts metadata.related_identifiers with scheme, identifier, and relation_type", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          related_identifiers: [
            {
              scheme: "doi",
              identifier: "10.1234/abc",
              relation_type: "iscitedby",
              resource_type: "",
            },
          ],
        },
      })
    ).resolves.toBeTruthy();
  });
});

