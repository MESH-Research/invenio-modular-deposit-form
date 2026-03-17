import { addMethod } from "yup";
import * as yup from "yup";
import { edtfValidator, dateInSequence } from './validatorsForDates';

// Add validators to yup
addMethod(yup.string, "edtf", edtfValidator);
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
        await expect(edtfSchema.validate({ edtf: invalidEDTF })).rejects.toThrow("Invalid EDTF format");
      }
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

