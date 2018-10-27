import { parse, print } from "graphql";
import {
  Selection,
  Directive,
  Field,
  InlineFragment,
  FragmentSpread,
  Operation,
  VariableDefinition,
  FragmentDefinition,
  Variable
} from "./types";

export interface PrintOptions {
  pretty?: boolean;
}

export function printValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "null";
  } else if (typeof value === "boolean") {
    return `${value}`;
  } else if (typeof value === "number") {
    return `${value}`;
  } else if (typeof value === "string") {
    return `"${value}"`;
  } else if (value instanceof Variable) {
    return `$${value.name}`;
  } else if (value instanceof Array) {
    return `[${value.map(printValue).join(", ")}]`;
  } else {
    const valueobj = value as Record<string, unknown>;
    return `{${Object.keys(valueobj)
      .map(k => k + ": " + printValue(valueobj[k]))
      .join(", ")}}`;
  }
}

export function printArgs(args: Record<string, unknown>): string {
  if (Object.keys(args).length === 0) {
    return "";
  }
  return `(${Object.keys(args)
    .map(k => k + ": " + printValue(args[k]))
    .join(", ")})`;
}

function printVariableDefinition(def: VariableDefinition<any, any>) {
  const directives = def.directives.map(d => ` ${printDirective(d)}`).join("");
  return `$${def.name}: ${def.type}${
    def.defaultValue ? " = " + def.defaultValue : ""
  }${directives}`;
}

export function printOperation(
  operation: Operation,
  options: PrintOptions = {}
) {
  let operationDefinition;
  if (operation.type === "query" && operation.name === undefined) {
    operationDefinition = "";
  } else if (operation.name !== undefined) {
    operationDefinition = `${operation.type} ${operation.name}`;
  } else {
    throw new Error(`Operation type ${operation.type} requires a name`);
  }
  const fragmentDefinitions =
    operation.fragmentDefinitions.length > 0
      ? operation.fragmentDefinitions.map(printFragmentDefinition).join(" ") +
        " "
      : "";
  const variableDefinitions =
    operation.variableDefinitions.length > 0
      ? `(${operation.variableDefinitions
          .map(printVariableDefinition)
          .join(" ")})`
      : "";
  const directives =
    operation.directives.length > 0
      ? operation.directives.map(d => ` ${printDirective(d)}`).join("")
      : "";
  const selectionSet =
    operation.selectionSet.length > 0
      ? " {" +
        operation.selectionSet.map(s => ` ${printSelection(s)}`).join("") +
        " }"
      : "";

  let operationString = `${fragmentDefinitions}${operationDefinition}${variableDefinitions}${directives}${selectionSet}`;
  if (options.pretty) {
    operationString = print(parse(operationString));
  }
  return operationString;
}

export function printDirective(directive: Directive) {
  const args = directive.args ? printArgs(directive.args) : "";
  return `@${directive.name}${args}`;
}

export function printField(field: Field): string {
  const alias = field.alias ? `${field.alias}: ` : "";
  const args = printArgs(field.args);
  const directives =
    field.directives.length > 0
      ? field.directives.map(d => ` ${printDirective(d)}`).join("")
      : "";
  const selectionSet =
    field.selectionSet.length > 0
      ? " {" +
        field.selectionSet.map(s => ` ${printSelection(s)}`).join("") +
        " }"
      : "";
  return `${alias}${field.name}${args}${directives}${selectionSet}`;
}

export function printFragmentDefinition(
  fragment: FragmentDefinition<any>
): string {
  const directives =
    fragment.directives.length > 0
      ? fragment.directives.map(d => ` ${printDirective(d)}`).join("")
      : "";
  const selectionSet =
    fragment.selectionSet.length > 0
      ? " {" +
        fragment.selectionSet.map(s => ` ${printSelection(s)}`).join("") +
        " }"
      : "";
  return `fragment ${fragment.name} on ${
    fragment.type
  }${directives}${selectionSet}`;
}

export function printInlineFragment(fragment: InlineFragment): string {
  const directives =
    fragment.directives.length > 0
      ? fragment.directives.map(d => ` ${printDirective(d)}`).join("")
      : "";
  const selectionSet =
    fragment.selectionSet.length > 0
      ? " {" +
        fragment.selectionSet.map(s => ` ${printSelection(s)}`).join("") +
        " }"
      : "";
  return `... on ${fragment.type}${directives}${selectionSet}`;
}

export function printFragmentSpread(fragment: FragmentSpread): string {
  const directives =
    fragment.directives.length > 0
      ? fragment.directives.map(d => ` ${printDirective(d)}`).join("")
      : "";
  return `...${fragment.name}${directives}`;
}

export function printSelection(selection: Selection): string {
  if (selection.selectionType === "Field") {
    return printField(selection as Field);
  } else if (selection.selectionType === "InlineFragment") {
    return printInlineFragment(selection as InlineFragment);
  } else if (selection.selectionType === "FragmentSpread") {
    return printFragmentSpread(selection as FragmentSpread);
  } else {
    throw new Error(`Unknown selection type: ${JSON.stringify(selection)}`);
  }
}
