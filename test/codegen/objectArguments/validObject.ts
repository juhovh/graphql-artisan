import schema, { Query } from "./schema";

export default schema
  .query()
  .select(Query.three({ value: { two: { one: { id: 123 } } } }));
