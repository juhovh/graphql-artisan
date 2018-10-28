import schema, { Query } from "./schema";

export default schema
  .query()
  .select(Query.nullableScalar({ value: undefined }));
