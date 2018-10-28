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
});
