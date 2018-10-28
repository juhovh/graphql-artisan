import schema, { Query } from "./schema";

export default schema.query().select(Query.three({ value: { name: "test" } }));
