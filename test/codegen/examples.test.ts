import { processSchema, assertValidQuery, assertInvalidQuery } from "./utils";

describe("An example schema", () => {
  const fixturePath = "examples";
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
