import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A schema with object query arguments", () => {
  const fixturePath = "objectArguments";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("should accept valid objects", () => {
    assertValidQuery(fixturePath, "validObject.ts", "validObject.txt");
  });
});
