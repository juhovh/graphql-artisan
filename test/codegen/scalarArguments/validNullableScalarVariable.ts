import schema, { Query, String$Variable } from "./schema";

const variableDef = String$Variable("test").nullable.getDefinition();
const variable = variableDef.getVariable();
export default schema
  .query("name")
  .select(Query.nullableScalar({ value: variable }))
  .withVariables(variableDef);
