import schema, { Query, User, $skip } from "./schema";

export default
schema.query().select(
  Query.user({ id: "123" }).select(
    User.id($skip({ if: true })),
    User.name()
  )
);
