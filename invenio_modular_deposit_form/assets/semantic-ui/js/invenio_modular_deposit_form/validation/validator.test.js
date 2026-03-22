import buildValidationSchema from "./validator";

describe("validator (full form validation) - pids.doi", () => {
  const schema = buildValidationSchema({});

  const baseForm = {
    custom_fields: {},
    metadata: {
      creators: [
        {
          role: "author",
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

  it("requires pids.doi.identifier when pids.doi.provider is external", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        pids: {
          doi: {
            provider: "external",
          },
        },
      })
    ).rejects.toMatchObject({ path: "pids.doi.identifier" });
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
              role: "author",
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

  it("rejects invalid ORCID on contributor person_or_org.identifiers (validIdentifierForScheme)", async () => {
    await expect(
      schema.validate({
        ...baseForm,
        metadata: {
          ...baseForm.metadata,
          contributors: [
            {
              role: "editor",
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
});

