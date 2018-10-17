# GraphQL Artisan

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Type safe GraphQL query generator for TypeScript. **Works with `typescript@>=3.0`**.

## Installation

```sh
npm install graphql-artisan
npm install graphql
```

## Usage

This library is still very much work in progress, more instructions will be added soon!

## Examples

All the examples below are written using the following schema:

```graphql
type User { id: ID! name: String! age: Int }
interface Message { id: ID! createdBy: ID! title: String! }
type Headline implements Message { id: ID! createdBy: ID! title: String! tags: [String] }
type Article implements Message { id: ID! createdBy: ID! title: String! content: String }
input UserEdit { id: ID! name: String age: Int }

type Query {
  user(id: ID!): User
  userMessages(id: ID): [Message!]!
}
type Mutation {
  updateUser(user: UserEdit!): User
}
schema {
  query: Query
  mutation: Mutation
}
```

### Simple queries

You can create anonymous queries with a simple syntax:

```typescript
schema.query().select(
  Query.user({ id: "123" }).select(
    User.id(),
    User.name()
  )
);
```

This can be serialized into the following GraphQL query:

```graphql
{
  user(id: "123") {
    id
    name
  }
}
```

This might not seem very interesting, but notice that you can also generate queries like this:

```typescript
function users(...userIds: number[]) {
  return userIds.map(id =>
    Query.user({ id }).select(
      User.id(),
      User.name()
    ).as(`user${id}`)
  );
}
schema.query().select(users(1, 2, 3));
```

The query above will be serialized as:

```graphql
{
  user1: user(id: 1) {
    id
    name
  }
  user2: user(id: 2) {
    id
    name
  }
  user3: user(id: 3) {
    id
    name
  }
}
```

All without any ugly string concatenations or unsafe operations.

### Named queries

Just like above, you can also name your queries, which is required to be able to add directives:

```typescript
schema.query("queryName").select(
  Query.user({ id: "123" }).select(
    User.id(),
    User.name()
  )
);
```

The query name will be added to the serialized query as expected:

```graphql
query queryName {
  user(id: "123") {
    id
    name
  }
}
```

### Queries with directives

Because `@` sign is not allowed in JavaScript/TypeScript names, `$` is used instead for directives. You can for example write the following query:

```typescript
schema.query().select(
  Query.user({ id: "123" }).select(
    User.id($skip({ if: true })),
    User.name()
  )
);
```

It will result in the following query:

```graphql
{
  user(id: "123") {
    id @skip(if: true)
    name
  }
}
```

### Queries containing interfaces

If the query requires selecting an interface and you only want to select its interface fields, you can write the query as expected:

```typescript
schema.query().select(
  Query.userMessages({ id: "123" }).select(
    Message.id(),
    Message.createdBy(),
    Message.title()
  )
);
```

The serialized version has no surprises either:

```graphql
{
  userMessages(id: "123") {
    id
    createdBy
    title
  }
}
```

However, if you want to also query for some fields that implement that interface, you need to be able to use fragments. Don't worry, this is not difficult either:

```typescript
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
```

The inline fragments will now be serialized into the query as specified:

```graphql
{
  userMessages(id: "123") {
    id
    createdBy
    title
    ... on Headline {
      tags
    }
    ... on Article {
      content
    }
  }
}
```

### Mutations

Mutations work just like queries and the arguments are also typed as expected. If doing multiple mutations you can also always rely that the order of the selections in code is the same as in the resulting query. An example mutation could go like this:

```typescript
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
```

You will then get your mutation as a GraphQL query string when serialized:

```graphql
mutation mutationName {
  updateUser(user: {id: "123", name: "John Doe"}) {
    id
    name
  }
}
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/graphql-artisan.svg?style=flat
[npm-url]: https://npmjs.org/package/graphql-artisan
[downloads-image]: https://img.shields.io/npm/dm/graphql-artisan.svg?style=flat
[downloads-url]: https://npmjs.org/package/graphql-artisan
[travis-image]: https://img.shields.io/travis/juhovh/graphql-artisan.svg?style=flat
[travis-url]: https://travis-ci.org/juhovh/graphql-artisan
[coveralls-image]: https://img.shields.io/coveralls/juhovh/graphql-artisan.svg?style=flat
[coveralls-url]: https://coveralls.io/r/juhovh/graphql-artisan?branch=master
