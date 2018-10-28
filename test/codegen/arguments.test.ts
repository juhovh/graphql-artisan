import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A schema with query arguments", () => {
  const fixturePath = "arguments";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("should accept valid scalars", () => {
    assertValidQuery(fixturePath, "validScalar.ts", "validScalar.txt");
  });
  test("should accept valid scalar variables", () => {
    assertValidQuery(
      fixturePath,
      "validScalarVariable.ts",
      "validScalarVariable.txt"
    );
  });
  test("should reject invalid scalar type", () => {
    assertInvalidQuery(fixturePath, "invalidScalar.ts");
  });
  test("should reject invalid scalar variable", () => {
    assertInvalidQuery(fixturePath, "invalidScalarVariable.ts");
  });
  test("should accept valid nullable scalars", () => {
    assertValidQuery(
      fixturePath,
      "validNullableScalar.ts",
      "validNullableScalar.txt"
    );
  });
  test("should accept valid nullable scalar variables", () => {
    assertValidQuery(
      fixturePath,
      "validNullableScalarVariable.ts",
      "validNullableScalarVariable.txt"
    );
  });
  test("should accept valid scalar arrays", () => {
    assertValidQuery(
      fixturePath,
      "validScalarArray.ts",
      "validScalarArray.txt"
    );
  });
  // FIXME: This test should not fail
  test.skip("should accept valid scalar array variables", () => {
    assertValidQuery(
      fixturePath,
      "validScalarArrayVariable.ts",
      "validScalarArrayVariable.txt"
    );
  });
  test("should reject invalid scalar arrays", () => {
    assertInvalidQuery(fixturePath, "invalidScalarArray.ts");
  });
  test("should reject invalid scalar array contents", () => {
    assertInvalidQuery(fixturePath, "invalidScalarArrayContents.ts");
  });
  test("should reject invalid scalar array variables", () => {
    assertInvalidQuery(fixturePath, "invalidScalarArrayVariable.ts");
  });
  test("should reject invalid scalar array content variables", () => {
    assertInvalidQuery(fixturePath, "invalidScalarArrayContentsVariable.ts");
  });
});
