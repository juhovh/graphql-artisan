import schema, { Query, String$Variable } from "./schema";

const variableDef = String$Variable("test").asArray.nullable.getDefinition();
const variable = variableDef.getVariable();

export default schema.query().select(Query.scalarArray({ value: variable }));
