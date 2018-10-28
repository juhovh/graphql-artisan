import schema, { Query, String$Variable } from "./schema";

const variableDef = String$Variable("test")
  .asNullable()
  .getDefinition();
const variable = variableDef.getVariable();

export default schema.query().select(Query.scalar({ value: variable }));
