import { addMethod } from "yup";
import * as yup from "yup";
import {
  dateInSequence,
  edtfSingleDateStartUtcMs,
  edtfSingleDateValidator,
  edtfValidator,
  embargoConsistencyTest,
  isoDateStringValidator,
} from "./validatorsForDates";

// Add validators to yup
addMethod(yup.string, "edtf", edtfValidator);
addMethod(yup.string, "edtfSingle", edtfSingleDateValidator);
addMethod(yup.string, "isoDateString", isoDateStringValidator);
addMethod(yup.string, "dateInSequence", dateInSequence);

describe("validatorsForDates", () => {

  describe("edtfValidator", () => {
    const edtfSchema = yup.object().shape({
      edtf: yup.string().nullable().edtf(),
    });

    const validEDTFs = [
      "2023",
      "2023-05",
      "2023-05-20",
      "2023-05-20/2023-05-21",
      "2023-05/2023-06",
      "2023/2024"
    ];

    const invalidEDTFs = [
      "3047",
      "2023-13",
      "20234",
      "203",
      "2026-01-31/23r",
      "rbdg",
      "2023-01-01/2023-13-01",
      "2023-01-01/2023-02-30",
    ];

    it('validates correct formats', async () => {
      for ( const validEDTF of validEDTFs ) {
        await expect(edtfSchema.validate({edtf: validEDTF})).resolves.toBeTruthy();
      }
    });

    it ("should allow null and undefined values", async () => {
      await expect(edtfSchema.validate({ edtf: null }))
        .resolves.toBeTruthy();
      await expect(edtfSchema.validate({ edtf: undefined }))
        .resolves.toBeTruthy();
    });

    it ("should reject invalid formats", async () => {
      for ( const invalidEDTF of invalidEDTFs ) {
        await expect(edtfSchema.validate({ edtf: invalidEDTF })).rejects.toThrow(
          "Date must be formatted like YYYY-MM-DD (ranges like YYYY-MM-DD/YYY-MM-DD)"
        );
      }
    });
  });

  describe("edtfSingleDateValidator", () => {
    const singleSchema = yup.object().shape({
      d: yup.string().nullable().edtfSingle(),
    });

    const validSingles = ["2023", "2023-05", "2023-05-20"];

    const invalidSingles = [
      "2023-05-20/2023-05-21",
      "2023/2024",
      "2023-05/2023-06",
      "3047",
      "2023-13",
    ];

    it("accepts single dates only", async () => {
      for (const v of validSingles) {
        await expect(singleSchema.validate({ d: v })).resolves.toBeTruthy();
      }
    });

    it("rejects ranges (slash)", async () => {
      for (const v of invalidSingles) {
        await expect(singleSchema.validate({ d: v })).rejects.toThrow(
          "Date must be formatted like YYYY-MM-DD (single date only, no range)"
        );
      }
    });
  });

  describe("isoDateStringValidator", () => {
    const isoSchema = yup.object().shape({
      d: yup.string().nullable().isoDateString(),
    });

    it("accepts only YYYY-MM-DD", async () => {
      await expect(isoSchema.validate({ d: "2023-05-20" })).resolves.toBeTruthy();
    });

    it("allows empty and null", async () => {
      await expect(isoSchema.validate({ d: null })).resolves.toBeTruthy();
      await expect(isoSchema.validate({ d: "" })).resolves.toBeTruthy();
    });

    it("rejects EDTF year-only and year-month", async () => {
      await expect(isoSchema.validate({ d: "2023" })).rejects.toThrow(
        "Invalid ISO date (use YYYY-MM-DD)."
      );
      await expect(isoSchema.validate({ d: "2023-05" })).rejects.toThrow(
        "Invalid ISO date (use YYYY-MM-DD)."
      );
    });

    it("rejects invalid calendar days", async () => {
      await expect(isoSchema.validate({ d: "2023-02-30" })).rejects.toThrow(
        "Invalid ISO date (use YYYY-MM-DD)."
      );
    });
  });

  describe("embargoConsistencyTest", () => {
    const embargoSchema = yup.object().shape({
      embargo: yup
        .object()
        .shape({
          active: yup.boolean(),
          until: yup.string().isoDateString(),
        })
        .test("embargo-consistency", embargoConsistencyTest),
    });

    it("requires future until when active is true", async () => {
      await expect(
        embargoSchema.validate({
          embargo: { active: true, until: "2000-01-01" },
        })
      ).rejects.toMatchObject({ path: "embargo.until" });
    });

    it("rejects future until when active is false", async () => {
      await expect(
        embargoSchema.validate({
          embargo: { active: false, until: "2099-12-31" },
        })
      ).rejects.toMatchObject({ path: "embargo.until" });
    });
  });

  describe("edtfSingleDateStartUtcMs", () => {
    it("returns UTC start-of-day for year, year-month, and full date", () => {
      expect(edtfSingleDateStartUtcMs("2023")).toBe(Date.UTC(2023, 0, 1));
      expect(edtfSingleDateStartUtcMs("2023-05")).toBe(Date.UTC(2023, 4, 1));
      expect(edtfSingleDateStartUtcMs("2023-05-20")).toBe(
        Date.UTC(2023, 4, 20)
      );
    });

    it("returns null for invalid or empty values", () => {
      expect(edtfSingleDateStartUtcMs(null)).toBeNull();
      expect(edtfSingleDateStartUtcMs("")).toBeNull();
      expect(edtfSingleDateStartUtcMs("2023-13")).toBeNull();
      expect(edtfSingleDateStartUtcMs("2023-02-30")).toBeNull();
      expect(edtfSingleDateStartUtcMs("2023-05-20/2023-05-21")).toBeNull();
    });
  });

  describe("dateInSequence", () => {
    const schema = yup.string().dateInSequence();
    test('end date after start date', () => {
        expect(schema.isValidSync('2023-01-01/2023-01-02')).toBe(true);
    });

    test('start date after end date', () => {
      expect(schema.isValidSync('2023-01-02/2023-01-01')).toBe(false);
      expect(schema.isValidSync('2023-02/2023-01')).toBe(false);
      expect(schema.isValidSync('2024/2023')).toBe(false);
    });
  });
});

