import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("A simple schema", () => {
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

describe("A schema with directives", () => {
  const fixturePath = "fixtures/directives";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("can generate a full query", () => {
    assertValidQuery(fixturePath, "queryFull.ts", "queryFull.txt");
  });
});

describe("An example schema", () => {
  const fixturePath = "fixtures/examples";
  beforeAll(async () => {
    await processSchema(fixturePath);
  });
  test("can get a user", () => {
    assertValidQuery(fixturePath, "getUser.ts", "getUser.txt");
  });
  test("can get multiple users", () => {
    assertValidQuery(
      fixturePath,
      "getMultipleUsers.ts",
      "getMultipleUsers.txt"
    );
  });
  test("can get a user with a named query", () => {
    assertValidQuery(fixturePath, "getUserNamed.ts", "getUserNamed.txt");
  });
  test("can get a user using a directive", () => {
    assertValidQuery(
      fixturePath,
      "getUserWithDirective.ts",
      "getUserWithDirective.txt"
    );
  });
  test("can get user messages", () => {
    assertValidQuery(fixturePath, "getUserMessages.ts", "getUserMessages.txt");
  });
  test("can get user messages with fragments", () => {
    assertValidQuery(
      fixturePath,
      "getUserMessagesWithFragments.ts",
      "getUserMessagesWithFragments.txt"
    );
  });
  test("can update user", () => {
    assertValidQuery(fixturePath, "updateUser.ts", "updateUser.txt");
  });
});
