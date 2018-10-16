import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A simple schema", async () => {
  const fixturePath = "fixtures/simple";
  beforeAll(async () => {
    processSchema(fixturePath);
  });
  test("can generate a minimal query", () => {
    assertValidQuery(fixturePath, "queryMinimal.ts", "queryMinimal.txt");
  });
  test("can generate a full query", () => {
    assertValidQuery(fixturePath, "queryFull.ts", "queryFull.txt");
  });
  test("will fail on a query with invalid field type", () => {
    assertInvalidQuery(fixturePath, "queryInvalidField.ts");
  });
  test("can generate a mutation", () => {
    assertValidQuery(fixturePath, "mutation.ts", "mutation.txt");
  });
  test("will fail on a mutation without a name", () => {
    assertInvalidQuery(fixturePath, "mutationWithoutName.ts");
  });
});

describe("A schema with directives", async () => {
  const fixturePath = "fixtures/directives";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("can generate a full query", () => {
    assertValidQuery(fixturePath, "queryFull.ts", "queryFull.txt");
  });
});
