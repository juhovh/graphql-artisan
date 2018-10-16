import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import {
  graphql,
  parse,
  buildASTSchema,
  introspectionQuery,
  IntrospectionQuery
} from "graphql";
import * as ts from "typescript";
import { defineSchema } from "../../src/codegen/generator";
import { Operation } from "../../src";

const tsOptions: ts.CompilerOptions = {
  lib: ["lib.esnext.d.ts"],
  target: ts.ScriptTarget.ES5,
  strict: true
};

async function processSchema(fixturePath: string) {
  const pathLength = fixturePath.split("/").length;
  const pathPrefix = "../".repeat(pathLength);
  const inputFile = path.join(__dirname, fixturePath, "schema.graphql");
  const { dir, name } = path.parse(inputFile);
  const outputFile = path.join(dir, `${name}.ts`);
  const schemaStr = readFileSync(inputFile).toString("utf-8");
  const schema = buildASTSchema(parse(schemaStr));
  const { data, errors } = await graphql({
    schema: schema,
    source: introspectionQuery
  });
  expect(errors).toBeUndefined();
  const query = data as IntrospectionQuery;
  const sourcePath = `${pathPrefix}../../src`;
  const generatorStr = defineSchema(query.__schema, sourcePath);
  writeFileSync(outputFile, generatorStr);
  return outputFile;
}

function getQueryDiagnostics(fixturePath: string, queryFile: string) {
  const inputDir = path.join(__dirname, fixturePath);
  const inputQuery = path.join(inputDir, queryFile);
  const program = ts.createProgram([inputQuery], tsOptions);
  const formatHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine
  };
  return ts
    .getPreEmitDiagnostics(program)
    .map(diagnostic => ts.formatDiagnostic(diagnostic, formatHost));
}

function getQueryString(fixturePath: string, queryFile: string): string {
  const module = path.join(__dirname, fixturePath, queryFile);
  const { default: query }: { default: Operation } = require(module);
  if (query === undefined) {
    throw new Error(`No default export found from file ${queryFile}`);
  }
  return query.print({ pretty: true });
}

function getExpectedString(fixturePath: string, expectedFile: string) {
  const filePath = path.join(__dirname, fixturePath, expectedFile);
  return readFileSync(filePath).toString("utf-8");
}

function assertInvalidQuery(fixturePath: string, queryFile: string) {
  const diagnostics = getQueryDiagnostics(fixturePath, queryFile);
  expect(diagnostics).not.toEqual([]);
}

function assertValidQuery(
  fixturePath: string,
  queryFile: string,
  expectedFile: string
) {
  const diagnostics = getQueryDiagnostics(fixturePath, queryFile);
  expect(diagnostics).toEqual([]);
  if (diagnostics.length > 0) {
    // We must return in order to not crash the runner
    return;
  }

  const queryString = getQueryString(fixturePath, queryFile);
  const expectedString = getExpectedString(fixturePath, expectedFile);
  expect(queryString).toStrictEqual(expectedString);
}

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
