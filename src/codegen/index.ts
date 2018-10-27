import {
  IntrospectionType,
  IntrospectionObjectType,
  IntrospectionInterfaceType,
  IntrospectionInputObjectType,
  IntrospectionField,
  IntrospectionNamedTypeRef,
  IntrospectionTypeRef,
  IntrospectionInputTypeRef,
  IntrospectionDirective,
  IntrospectionSchema,
  IntrospectionInputValue,
  IntrospectionScalarType
} from "graphql";

function getType<T>(
  types: ReadonlyArray<IntrospectionType>,
  typeRef: IntrospectionNamedTypeRef<any>
) {
  const matchedTypes = types.filter(
    type =>
      (typeRef.kind === undefined || typeRef.kind === type.kind) &&
      typeRef.name === type.name
  );
  if (matchedTypes.length > 0) {
    return matchedTypes[0];
  } else {
    throw new Error(`Could not find type ${typeRef.name} kind ${typeRef.kind}`);
  }
}

function defineField(
  types: ReadonlyArray<IntrospectionType>,
  parentType: IntrospectionType,
  field: IntrospectionField
) {
  function flattenType(
    type: IntrospectionTypeRef
  ): IntrospectionNamedTypeRef<any> {
    if (type.kind === "NON_NULL" || type.kind === "LIST") {
      return flattenType(type.ofType);
    } else {
      return type;
    }
  }
  const typeRef = flattenType(field.type);
  const type = getType(types, typeRef);
  function getArgsType(args: ReadonlyArray<IntrospectionInputValue>) {
    if (args.length > 0) {
      return (
        "{" +
        args.map(arg => `${defineInputArgument(types, arg)}`).join(", ") +
        "}"
      );
    }
  }
  function createScalar(
    parentType: string,
    fieldName: string,
    argsType?: string
  ) {
    if (argsType) {
      return `createScalarWithArgs<${parentType}Field, ${argsType}>("${fieldName}")`;
    } else {
      return `createScalar<${parentType}Field>("${fieldName}")`;
    }
  }
  function createField(
    parentType: string,
    fieldName: string,
    childType: string,
    argsType?: string
  ) {
    if (argsType) {
      return `createFieldWithArgs<${parentType}Field, ${childType}, ${argsType}>("${fieldName}")`;
    } else {
      return `createField<${parentType}Field, ${childType}>("${fieldName}")`;
    }
  }
  if (type.kind === "SCALAR" || type.kind === "ENUM") {
    return createScalar(parentType.name, field.name, getArgsType(field.args));
  } else if (type.kind === "INTERFACE") {
    const childType = [
      `${type.name}Field`,
      ...type.possibleTypes
        .map(typeRef => getType(types, typeRef))
        .map(type => `${type.name}Fragment`)
    ].join(" | ");
    return createField(
      parentType.name,
      field.name,
      childType,
      getArgsType(field.args)
    );
  } else if (type.kind === "UNION") {
    const childType = type.possibleTypes
      .map(typeRef => getType(types, typeRef))
      .map(type => `${type.name}Fragment`)
      .join(" | ");
    return createField(
      parentType.name,
      field.name,
      childType,
      getArgsType(field.args)
    );
  } else if (type.kind === "OBJECT") {
    const childType = `${type.name}Field | ${type.name}Fragment`;
    return createField(
      parentType.name,
      field.name,
      childType,
      getArgsType(field.args)
    );
  } else if (type.kind === "INPUT_OBJECT") {
    throw new Error("Unexpected input object");
  }
}

function defineInlineFragment(
  type: IntrospectionObjectType | IntrospectionInterfaceType
) {
  return `createInlineFragment<${type.name}Fragment, ${type.name}Field>("${
    type.name
  }")`;
}

function defineFragmentDefinition(
  type: IntrospectionObjectType | IntrospectionInterfaceType
) {
  return `createFragmentDefinition<${type.name}Fragment, ${type.name}Field>("${
    type.name
  }")`;
}

function defineObject(
  types: ReadonlyArray<IntrospectionType>,
  type: IntrospectionObjectType | IntrospectionInterfaceType
): string {
  return `
/* ${type.name} interfaces and builders */
interface ${type.name}Field extends Field {
  __${type.name}Field: unknown;
}
interface ${type.name}Fragment extends InlineFragment, FragmentSpread {
  __${type.name}Fragment: unknown;
}
export const ${type.name}$InlineFragment = ${defineInlineFragment(type)};
export const ${type.name}$FragmentDefinition = ${defineFragmentDefinition(
    type
  )};
export const ${type.name} = {
  ${type.fields
    .map(field => field.name + ": " + defineField(types, type, field))
    .join(",\n  ")}
};
`;
}

function defineInputValue(
  types: ReadonlyArray<IntrospectionType>,
  valueType: IntrospectionInputTypeRef
): string {
  function typeOrVariable(typeName: string, typeValue: string) {
    return `${typeValue} | Variable<"${typeName}", ${typeValue}>`;
  }
  const nullableType = valueType.kind !== "NON_NULL" ? " | undefined" : "";
  if (valueType.kind === "NON_NULL") {
    valueType = valueType.ofType;
  }
  if (valueType.kind === "LIST") {
    return `Array<${defineInputValue(types, valueType.ofType)}${nullableType}>`;
  } else {
    const type = getType(types, valueType);
    if (type.kind === "INPUT_OBJECT") {
      return typeOrVariable(type.name, `${type.name}InputType${nullableType}`);
    } else if (type.kind === "ENUM") {
      return (
        type.enumValues.map(val => `"${val.name}"`).join(" | ") + nullableType
      );
    } else if (type.kind === "SCALAR") {
      return typeOrVariable(type.name, getScalarType(type) + nullableType);
    }
    throw new Error(
      `Unknown input type "${valueType.name}: ${valueType.kind}"`
    );
  }
}

function defineInputArgument(
  types: ReadonlyArray<IntrospectionType>,
  argument: IntrospectionInputValue
) {
  const nullable = argument.type.kind !== "NON_NULL" || !!argument.defaultValue;
  return `${argument.name}${nullable ? "?" : ""}: ${defineInputValue(
    types,
    argument.type
  )}`;
}

function defineInputObject(
  types: ReadonlyArray<IntrospectionType>,
  type: IntrospectionInputObjectType
): string {
  return `
export const ${type.name}$Variable = createVariable<"${type.name}", ${
    type.name
  }InputType>("${type.name}");
export interface ${type.name}InputType extends InputObject {
  ${type.inputFields
    .map(field => defineInputArgument(types, field) + ";")
    .join("\n  ")}
}
`;
}

function defineImport(module: string = "graphql-artisan") {
  return `/* tslint: disable */
import {
  InputObject,
  QueryDirective,
  MutationDirective,
  SubscriptionDirective,
  FieldDirective,
  FragmentDefinitionDirective,
  FragmentSpreadDirective,
  InlineFragmentDirective,
  VariableDefinitionDirective,
  Variable,
  Field,
  InlineFragment,
  FragmentSpread,
  createOperation,
  createDirective,
  createDirectiveWithArgs,
  createVariable,
  createScalar,
  createScalarWithArgs,
  createField,
  createFieldWithArgs,
  createInlineFragment,
  createFragmentDefinition
} from "${module}";
`;
}

function defineDirective(
  types: ReadonlyArray<IntrospectionType>,
  directive: IntrospectionDirective
) {
  const directiveTypes = directive.locations
    .map(location => {
      switch (location) {
        case "QUERY":
          return "QueryDirective";
        case "MUTATION":
          return "MutationDirective";
        case "SUBSCRIPTION":
          return "SubscriptionDirective";
        case "FIELD":
          return "FieldDirective";
        case "FRAGMENT_DEFINITION":
          return "FragmentDefinitionDirective";
        case "FRAGMENT_SPREAD":
          return "FragmentSpreadDirective";
        case "INLINE_FRAGMENT":
          return "InlineFragmentDirective";
        case "VARIABLE_DEFINITION":
          return "VariableDefinitionDirective";
      }
    })
    .filter(t => !!t);
  if (directiveTypes.length === 0) {
    // This is not a query directive, output nothing
    return "";
  }
  const type = directiveTypes.join(" & ");
  if (directive.args.length > 0) {
    const args =
      "{" +
      directive.args
        .map(arg => `${defineInputArgument(types, arg)}`)
        .join(", ") +
      "}";
    return `export const $${
      directive.name
    } = createDirectiveWithArgs<${type}, ${args}>("${directive.name}");\n`;
  } else {
    return `export const $${directive.name} = createDirective<${type}>("${
      directive.name
    }");\n`;
  }
}

function getScalarType(type: IntrospectionScalarType) {
  switch (type.name) {
    case "ID":
      return "string | number";
    case "Int":
    case "Float":
      return "number";
    case "String":
      return "string";
    case "Boolean":
      return "boolean";
    default:
      return "unknown";
  }
}

function defineScalar(
  types: ReadonlyArray<IntrospectionType>,
  type: IntrospectionScalarType
) {
  return `export const ${type.name}$Variable = createVariable<"${
    type.name
  }", ${getScalarType(type)}>("${type.name}");
`;
}

function defineType(
  types: ReadonlyArray<IntrospectionType>,
  type: IntrospectionType
) {
  switch (type.kind) {
    case "SCALAR":
      return defineScalar(types, type);
    case "OBJECT":
    case "INTERFACE":
      return defineObject(types, type);
    case "INPUT_OBJECT":
      return defineInputObject(types, type);
    default:
      return "";
  }
}

function defineOperations(
  queryType: IntrospectionObjectType,
  mutationType?: IntrospectionObjectType,
  subscriptionType?: IntrospectionObjectType
) {
  const mutation = mutationType
    ? `,
  mutation: createOperation<MutationDirective, ${mutationType.name}Field | ${
        mutationType.name
      }Fragment>("mutation")`
    : "";
  const subscription = subscriptionType
    ? `,
  subscription: createOperation<SubscriptionDirective, ${
    subscriptionType.name
  }Field | ${subscriptionType.name}Fragment>("subscription")`
    : "";
  return `
/* Supported operations for the defined schema */
export default {
  query: createOperation<QueryDirective, ${queryType.name}Field | ${
    queryType.name
  }Fragment>("query")${mutation}${subscription}
};
`;
}

export function defineSchema(
  schema: IntrospectionSchema,
  modulePath: string = "graphql-artisan"
) {
  const queryType = getType(
    schema.types,
    schema.queryType
  ) as IntrospectionObjectType;
  const mutationType = schema.mutationType
    ? (getType(schema.types, schema.mutationType) as IntrospectionObjectType)
    : undefined;
  const subscriptionType = schema.subscriptionType
    ? (getType(
        schema.types,
        schema.subscriptionType
      ) as IntrospectionObjectType)
    : undefined;
  return (
    defineImport(modulePath) +
    "\n/* User and system directive definitions */\n" +
    schema.directives
      .filter(d => !d.name.startsWith("__"))
      .map(d => defineDirective(schema.types, d))
      .join("") +
    schema.types
      .filter(t => !t.name.startsWith("__"))
      .map(t => defineType(schema.types, t))
      .join("") +
    defineOperations(queryType, mutationType, subscriptionType)
  );
}
