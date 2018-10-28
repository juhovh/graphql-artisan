import schema, { Query, String$Variable } from "./schema";

const variableDef = String$Variable("test").asArray.getDefinition();
const variable = variableDef.getVariable();
export default schema
  .query("name")
  .select(Query.scalar({ value: variable }))
  .withVariables(variableDef);
