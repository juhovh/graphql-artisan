import schema, { Query, Three$Variable } from "./schema";

const variableDef = Three$Variable("test").getDefinition();
const variable = variableDef.getVariable();

export default schema.query().select(Query.three({ value: variable }));
