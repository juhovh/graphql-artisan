#!/usr/bin/env node

/* tslint:disable no-console */
import { readFileSync, writeFileSync } from "fs";
import {
  graphql,
  parse,
  buildASTSchema,
  introspectionQuery,
  GraphQLSchema,
  IntrospectionQuery
} from "graphql";
import { defineSchema } from "../codegen";

async function introspectSchema(
  schema: GraphQLSchema
): Promise<IntrospectionQuery> {
  const { data, errors } = await graphql({
    schema: schema,
    source: introspectionQuery
  });
  if (errors) {
    throw errors;
  }
  return data as IntrospectionQuery;
}

const argv = process.argv.slice(2);
if (argv.length !== 2) {
  console.log(
    `Usage: ${process.argv0} ${process.argv[1]} <inputschema> <output>`
  );
  process.exit(1);
}

const inputFile = argv[0];
const outputFile = argv[1];
let inputString;
try {
  inputString = readFileSync(inputFile).toString("utf8");
} catch (err) {
  console.error(`Error reading input file: ${err.message})\n`);
  inputString = "";
  process.exit(1);
}

introspectSchema(buildASTSchema(parse(inputString)))
  .then(q => defineSchema(q.__schema, "graphql-artisan"))
  .then(outputString => writeFileSync(outputFile, outputString))
  .catch(err => {
    console.error(`Error writing output file: ${err.message}\n`);
  });
