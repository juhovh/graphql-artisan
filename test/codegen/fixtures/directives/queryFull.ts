import schema, {
  Query,
  User,
  $query,
  $operation,
  $field,
  $fragmentdef,
  $fragmentspread,
  $inlinefragment,
  User$FragmentDefinition,
  User$InlineFragment,
  ID$Variable
} from "./schema";

const userIdFragment = User$FragmentDefinition(
  "userIdFragment",
  $fragmentdef
).select(User.id($field));

const variable = ID$Variable("variable")
  .nullable()
  .getDefinition();

export default schema
  .query("testQuery", $query, $operation)
  .select(
    Query.user({ id: variable.getVariable() }).select(
      userIdFragment.spread($fragmentspread),
      User$InlineFragment($inlinefragment).select(
        User.firstName($field),
        User.lastName().as("lastNameWithoutDirective")
      ),
      User.lastName($field)
    )
  )
  .withVariables(variable)
  .withFragments(userIdFragment);
