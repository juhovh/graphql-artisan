import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A schema with directives", () => {
  const fixturePath = "directives";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("can generate a full query", () => {
    assertValidQuery(fixturePath, "queryFull.ts", "queryFull.txt");
  });
});
