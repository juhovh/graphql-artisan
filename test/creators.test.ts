import {
  Field,
  InlineFragment,
  FragmentDefinition,
  FragmentSpread,
  QueryDirective
} from "../src/types";
import {
  createScalar,
  createField,
  createInlineFragment,
  createOperation,
  createFieldWithArgs
} from "../src/creators";
import { printOperation } from "../src/printers";

interface QueryField extends Field {
  __QueryField: unknown;
}
interface UserField extends Field {
  __UserField: unknown;
}
interface UserFragment extends InlineFragment, FragmentSpread {
  __UserFragment: unknown;
}
export interface UserFragmentDefinition
  extends FragmentDefinition<UserFragment> {
  __UserFragmentDefinition: unknown;
}
interface ArticleField extends Field {
  __ArticleField: unknown;
}
interface ArticleFragment extends InlineFragment, FragmentSpread {
  __ArticleFragment: unknown;
}
export interface ArticleFragmentDefinition
  extends FragmentDefinition<ArticleFragment> {
  __ArticleFragmentDefinition: unknown;
}
interface BlogField extends Field {
  __BlogField: unknown;
}
interface BlogFragment extends InlineFragment, FragmentSpread {
  __BlogFragment: unknown;
}

const Query = {
  getUser: createFieldWithArgs<
    QueryField,
    UserField | UserFragment,
    { name: string }
  >("getUser")
};

const Document = {
  query: createOperation<QueryDirective, QueryField>("query")
};

const User = {
  name: createScalar<UserField>("name"),
  age: createScalar<UserField>("age"),
  documents: createField<UserField, ArticleFragment | BlogFragment>("documents")
};

export const ArticleInlineFragment = createInlineFragment<
  ArticleFragment,
  ArticleField
>("Article");

const Article = {
  author: createScalar<ArticleField>("age"),
  content: createScalar<ArticleField>("content")
};

export const BlogInlineFragment = createInlineFragment<BlogFragment, BlogField>(
  "Blog"
);
const Blog = {
  title: createScalar<BlogField>("title")
};

test("A simple query generates the correct result", () => {
  const operation = Document.query("testQuery").select(
    Query.getUser({ name: "test" }).select(
      User.name().as("username"),
      User.age(),
      User.documents().select(
        ArticleInlineFragment().select(Article.author(), Article.content()),
        BlogInlineFragment().select(Blog.title())
      )
    )
  );
  expect(printOperation(operation)).toEqual(
    'query testQuery { getUser(name: "test") { username: name age documents { ... on Article { age content } ... on Blog { title } } } }'
  );
});
