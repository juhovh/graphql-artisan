import { readFileSync } from "fs";
import {
  graphql,
  parse,
  buildASTSchema,
  introspectionQuery,
  GraphQLSchema,
  IntrospectionQuery
} from "graphql";
import { defineSchema } from "./generator";

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

type ImplicitScalars = { [P in string]: "boolean" | "number" | "string" };

export function parseSchema(
  schemaString: string,
  scalars?: ImplicitScalars
): GraphQLSchema {
  const scalarDefs = scalars
    ? Object.keys(scalars)
        .map(k => `scalar ${k} `)
        .join("")
    : "";
  return buildASTSchema(parse(`${scalarDefs}${schemaString}`));
}

introspectSchema(
  parseSchema(readFileSync("test.graphql").toString("utf-8"), {
    Long: "number"
  })
)
  .then(s => {
    /* tslint:disable no-console */
    console.log(defineSchema(s.__schema, "."));
  })
  .catch(err => {
    /* tslint:disable no-console */
    console.log(err);
  });
