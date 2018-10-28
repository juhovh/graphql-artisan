import schema, { Mutation, User } from "./schema";

export default schema
  .mutation("testMutation")
  .select(
    Mutation.user({ id: "123", name: "name" }).select(User.id(), User.name())
  );
