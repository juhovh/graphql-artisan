import schema, { Query, String$Variable } from "./schema";

const variableDef = String$Variable("test").nullable.asArray.getDefinition();
const variable = variableDef.getVariable();

export default schema.query().select(Query.scalarArray({ value: variable }));
