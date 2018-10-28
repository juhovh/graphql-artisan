import schema, { Query, User } from "./schema";

export default schema
  .query("testQuery")
  .select(Query.user({ id: "123" }).select(User.id(), User.name()));
