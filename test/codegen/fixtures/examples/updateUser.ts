import schema, { Mutation, User } from "./schema";

export default
schema.mutation("mutationName").select(
  Mutation.updateUser({
    user: {
      id: "123",
      name: "John Doe"
    }
  }).select(
    User.id(),
    User.name()
  )
);
