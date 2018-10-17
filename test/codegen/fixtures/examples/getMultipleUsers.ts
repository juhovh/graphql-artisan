import schema, { Query, User } from "./schema";

function users(...userIds: number[]) {
  return userIds.map(id =>
    Query.user({ id }).select(
      User.id(),
      User.name()
    ).as(`user${id}`)
  );
}

export default
schema.query().select(users(1, 2, 3));
