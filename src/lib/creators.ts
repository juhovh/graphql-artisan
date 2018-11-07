import {
  InputType,
  OperationType,
  Operation,
  Selection,
  Directive,
  Field,
  FieldDirective,
  InlineFragment,
  InlineFragmentDirective,
  FragmentDefinition,
  FragmentDefinitionDirective,
  FragmentSpread,
  FragmentSpreadDirective,
  VariableBuilder,
  VariableDefinitionDirective
} from "./types";

export interface SelectFunction<TSelection, TResult> {
  (selections: Array<TSelection>): TResult;
  (selection: TSelection, ...selections: Array<TSelection>): TResult;
}

type OperationBuilder<
  TDirective extends Directive,
  TChild extends Selection
> = (
  name: string,
  ...directives: Array<TDirective>
) => {
  select: SelectFunction<TChild, Operation>;
};

// The only difference with OperationBuilder is that name is optional
type QueryOperationBuilder<
  TDirective extends Directive,
  TChild extends Selection
> = (
  name?: string,
  ...directives: Array<TDirective>
) => {
  select: SelectFunction<TChild, Operation>;
};

type DirectiveBuilder<
  TDirective extends Directive,
  TArgs extends Record<string, InputType>
> = (args: TArgs) => TDirective;

type ScalarBuilder<TField extends Field> = (
  ...directives: Array<FieldDirective>
) => TField;

type ScalarBuilderWithArgs<
  TField extends Field,
  TArgs extends Record<string, InputType>
> = (args: TArgs, ...directives: Array<FieldDirective>) => TField;

type FieldBuilder<TField extends Field, TChild extends Selection> = (
  ...directives: Array<FieldDirective>
) => {
  select: SelectFunction<TChild, TField>;
};

type FieldBuilderWithArgs<
  TField extends Field,
  TChild extends Selection,
  TArgs extends Record<string, InputType>
> = (
  args: TArgs,
  ...directives: Array<FieldDirective>
) => {
  select: SelectFunction<TChild, TField>;
};

type InlineFragmentBuilder<
  TFragment extends InlineFragment,
  TChild extends Selection
> = (
  ...directives: Array<InlineFragmentDirective>
) => {
  select: SelectFunction<TChild, TFragment>;
};

type FragmentDefinitionBuilder<
  TFragment extends FragmentSpread,
  TChild extends Selection
> = (
  name: string,
  ...directives: Array<FragmentDefinitionDirective>
) => {
  select: SelectFunction<TChild, FragmentDefinition<TFragment>>;
};

export function createDirective<TDirective extends Directive>(
  name: string
): TDirective {
  return {
    name,
    args: {} as Record<string, InputType>
  } as TDirective;
}

export function createDirectiveWithArgs<
  TDirective extends Directive,
  TArgs extends Record<string, InputType>
>(name: string): DirectiveBuilder<TDirective, TArgs> {
  return (args: TArgs) => {
    return {
      name,
      args: args as Record<string, InputType>
    } as TDirective;
  };
}

export function createVariable<TName extends string, TValue>(type: TName) {
  return (name: string, ...directives: Array<VariableDefinitionDirective>) =>
    new VariableBuilder<TName, TValue>(type, name, directives);
}

function getFieldBuilder<TField extends Field>(
  name: string,
  args: Record<string, InputType>,
  directives: ReadonlyArray<Directive>,
  selectionSet: ReadonlyArray<Selection>
) {
  const fieldProps = {
    selectionType: "Field",
    name,
    args,
    directives,
    selectionSet
  };
  function fieldAs(alias: string): TField {
    return {
      ...fieldProps,
      alias: alias,
      as: fieldAs
    } as TField;
  }
  return {
    ...fieldProps,
    as: fieldAs
  } as TField;
}

export function createScalar<TField extends Field>(
  name: string
): ScalarBuilder<TField> {
  return (...directives: Array<FieldDirective>) => {
    return getFieldBuilder(name, {}, directives, []);
  };
}

export function createScalarWithArgs<
  TField extends Field,
  TArgs extends Record<string, InputType>
>(name: string): ScalarBuilderWithArgs<TField, TArgs> {
  return (args: TArgs, ...directives: Array<FieldDirective>) => {
    return getFieldBuilder(name, args, directives, []);
  };
}

function mergeSelections<T extends Selection>(
  selection: T | Array<T>,
  selections: Array<T>
): ReadonlyArray<Selection> {
  if (selection instanceof Array) {
    return selection;
  } else {
    return [selection, ...selections];
  }
}

export function createField<TField extends Field, TChild extends Selection>(
  name: string
): FieldBuilder<TField, TChild> {
  return (...directives: Array<FieldDirective>) => ({
    select: (
      selection: TChild | Array<TChild>,
      ...selections: Array<TChild>
    ) => {
      return getFieldBuilder(
        name,
        {},
        directives,
        mergeSelections(selection, selections)
      ) as TField;
    }
  });
}

export function createFieldWithArgs<
  TField extends Field,
  TChild extends Selection,
  TArgs extends Record<string, InputType>
>(name: string): FieldBuilderWithArgs<TField, TChild, TArgs> {
  return (args: TArgs, ...directives: Array<FieldDirective>) => ({
    select: (
      selection: TChild | Array<TChild>,
      ...selections: Array<TChild>
    ) => {
      return getFieldBuilder(
        name,
        args,
        directives,
        mergeSelections(selection, selections)
      ) as TField;
    }
  });
}

export function createInlineFragment<
  TFragment extends InlineFragment,
  TChild extends Selection
>(type: string): InlineFragmentBuilder<TFragment, TChild> {
  return (...directives: Array<InlineFragmentDirective>) => ({
    select: (selection: TChild | Array<TChild>, ...selections: Array<TChild>) =>
      ({
        selectionType: "InlineFragment",
        type,
        directives: directives as ReadonlyArray<Directive>,
        selectionSet: mergeSelections(selection, selections)
      } as TFragment)
  });
}

export function createFragmentDefinition<
  TFragment extends FragmentSpread,
  TChild extends Selection
>(type: string): FragmentDefinitionBuilder<TFragment, TChild> {
  return (name: string, ...directives: Array<FragmentDefinitionDirective>) => ({
    select: (selection: TChild | Array<TChild>, ...selections: Array<TChild>) =>
      ({
        name,
        type,
        directives: directives as ReadonlyArray<Directive>,
        selectionSet: mergeSelections(selection, selections),
        spread: (...directives: Array<FragmentSpreadDirective>) =>
          ({
            selectionType: "FragmentSpread",
            name,
            directives: directives as ReadonlyArray<Directive>
          } as TFragment)
      } as FragmentDefinition<TFragment>)
  });
}

export function createOperation<
  TDirective extends Directive,
  TChild extends Selection
>(type: "query"): QueryOperationBuilder<TDirective, TChild>;
export function createOperation<
  TDirective extends Directive,
  TChild extends Selection
>(type: "mutation" | "subscription"): OperationBuilder<TDirective, TChild>;
export function createOperation<
  TDirective extends Directive,
  TChild extends Selection
>(
  type: OperationType
):
  | QueryOperationBuilder<TDirective, TChild>
  | OperationBuilder<TDirective, TChild> {
  if (type === "query") {
    return (name?: string, ...directives: Array<TDirective>) => ({
      select: (
        selection: TChild | Array<TChild>,
        ...selections: Array<TChild>
      ) => {
        return new Operation(
          type,
          name,
          directives,
          selection instanceof Array ? selection : [selection, ...selections]
        );
      }
    });
  } else {
    return (name: string, ...directives: Array<TDirective>) => ({
      select: (
        selection: TChild | Array<TChild>,
        ...selections: Array<TChild>
      ) => {
        return new Operation(
          type,
          name,
          directives,
          mergeSelections(selection, selections)
        );
      }
    });
  }
}
