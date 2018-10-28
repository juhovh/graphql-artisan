import schema, { Query, Message } from "./schema";

export default
schema.query().select(
  Query.userMessages({ id: "123" }).select(
    Message.id(),
    Message.createdBy(),
    Message.title()
  )
);
