import schema, { Query, Two$Variable } from "./schema";

const variableDef = Two$Variable("test").getDefinition();
const variable = variableDef.getVariable();

export default schema
  .query()
  .select(Query.three({ value: { one: { id: 123 }, two: variable } }));
