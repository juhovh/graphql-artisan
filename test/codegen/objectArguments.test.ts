import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A schema with object query arguments", () => {
  const fixturePath = "objectArguments";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("should accept valid objects", () => {
    assertValidQuery(fixturePath, "validObject.ts", "validObject.txt");
  });
  test("should accept valid object variable", () => {
    assertValidQuery(
      fixturePath,
      "validObjectVariable.ts",
      "validObjectVariable.txt"
    );
  });
  test("should accept valid object with nested variable", () => {
    assertValidQuery(
      fixturePath,
      "validObjectNestedVariable.ts",
      "validObjectNestedVariable.txt"
    );
  });
});
