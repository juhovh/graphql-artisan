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

### Simple query

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
