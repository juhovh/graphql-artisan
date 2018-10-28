import schema, { Query, Message, Headline, Headline$InlineFragment, Article$InlineFragment, Article } from "./schema";

export default
schema.query().select(
  Query.userMessages({ id: "123" }).select(
    Message.id(),
    Message.createdBy(),
    Message.title(),
    Headline$InlineFragment().select(
      Headline.tags()
    ),
    Article$InlineFragment().select(
      Article.content()
    )
  )
);
