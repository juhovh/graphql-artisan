import { PrintOptions, printOperation } from "./printers";

// There is no limit on nesting arrays in GraphQL, we limit to 3
export type InputType =
  | undefined
  | unknown
  | boolean
  | number
  | string
  | InputObject
  | Array<undefined | unknown | boolean | number | string | InputObject>
  | Variable<
      any,
      undefined | unknown | boolean | number | string | InputObject
    >;

export type OperationType = "query" | "mutation" | "subscription";
export class Operation {
  readonly __Operation: unknown;
  private _variableDefinitions: ReadonlyArray<VariableDefinition<any, any>>;
  private _fragmentDefinitions: ReadonlyArray<FragmentDefinition<any>>;
  constructor(
    readonly type: OperationType,
    readonly name: string | undefined,
    readonly directives: ReadonlyArray<Directive>,
    readonly selectionSet: ReadonlyArray<Selection>
  ) {
    this._variableDefinitions = [];
    this._fragmentDefinitions = [];
  }
  get variableDefinitions() {
    return this._variableDefinitions;
  }
  get fragmentDefinitions() {
    return this._fragmentDefinitions;
  }
  withVariables(
    ...variableDefinitions: Array<VariableDefinition<any, any>>
  ): this {
    this._variableDefinitions = variableDefinitions;
    return this;
  }
  withFragments(...fragmentDefinitions: Array<FragmentDefinition<any>>): this {
    this._fragmentDefinitions = fragmentDefinitions;
    return this;
  }
  print(options: PrintOptions = {}): string {
    return printOperation(this, options);
  }
}

export interface InputObject {
  readonly __InputObject: unknown;
}

export interface Directive {
  readonly __Directive: unknown;
  readonly name: string;
  readonly args?: Record<string, InputType>;
}
export interface QueryDirective extends Directive {
  readonly __QueryDirective: unknown;
}
export interface MutationDirective extends Directive {
  readonly __MutationDirective: unknown;
}
export interface SubscriptionDirective extends Directive {
  readonly __SubscriptionDirective: unknown;
}
export interface FieldDirective extends Directive {
  readonly __FieldDirective: unknown;
}
export interface FragmentDefinitionDirective extends Directive {
  readonly __FragmentDefinitionDirective: unknown;
}
export interface FragmentSpreadDirective extends Directive {
  readonly __FragmentSpreadDirective: unknown;
}
export interface InlineFragmentDirective extends Directive {
  readonly __InlineFragmentDirective: unknown;
}
export interface VariableDefinitionDirective extends Directive {
  readonly __VariableDefinitionDirective: unknown;
}

export class VariableBuilder<TName extends string, TValue> {
  readonly baseType: TName;
  readonly name: string;
  private type: string;
  constructor(type: TName, name: string) {
    this.baseType = type;
    this.name = name;
    this.type = `${this.baseType}!`;
  }
  array(): VariableBuilder<TName, Array<TValue>> {
    const builder = new VariableBuilder<TName, Array<TValue>>(
      this.baseType,
      this.name
    );
    builder.type = `[${this.type}]!`;
    return builder;
  }
  nullable(): VariableBuilder<TName, TValue | undefined> {
    const builder = new VariableBuilder<TName, TValue | undefined>(
      this.baseType,
      this.name
    );
    if (this.type.substr(this.type.length - 1) === "!") {
      builder.type = this.type.substr(0, this.type.length - 1);
    }
    return builder;
  }
  getDefinition(
    ...directives: Array<VariableDefinitionDirective>
  ): VariableDefinition<TName, TValue> {
    return new VariableDefinition<TName, TValue>(
      this.type,
      this.name,
      directives
    );
  }
}

export class VariableDefinition<TName extends string, TValue> {
  readonly __VariableDefinition: unknown;
  private _defaultValue?: TValue;
  constructor(
    readonly type: string,
    readonly name: string,
    readonly directives: ReadonlyArray<VariableDefinitionDirective>
  ) {}
  get defaultValue() {
    return this._defaultValue;
  }
  withDefaultValue(defaultValue: TValue): this {
    this._defaultValue = defaultValue;
    return this;
  }
  getVariable() {
    return new Variable<TName, TValue>(this.name);
  }
}

export class Variable<TName extends string, TValue> {
  readonly __VariableType?: TName;
  readonly __VariableValue?: TValue;
  constructor(readonly name: string) {}
}

export interface Selection {
  readonly selectionType: "Field" | "InlineFragment" | "FragmentSpread";
}

export interface Field extends Selection {
  readonly __Field: unknown;
  readonly alias?: string;
  readonly name: string;
  readonly args: Record<string, unknown>;
  readonly directives: ReadonlyArray<Directive>;
  readonly selectionSet: ReadonlyArray<Selection>;
  readonly as: (alias: string) => this;
}

export interface InlineFragment extends Selection {
  readonly __InlineFragment: unknown;
  readonly type: string;
  readonly directives: ReadonlyArray<Directive>;
  readonly selectionSet: ReadonlyArray<Selection>;
}

export interface FragmentSpread extends Selection {
  readonly __FragmentSpread: unknown;
  readonly name: string;
  readonly directives: ReadonlyArray<Directive>;
}

export interface FragmentDefinition<TFragment extends FragmentSpread> {
  readonly __FragmentDefinition: unknown;
  readonly name: string;
  readonly type: string;
  readonly directives: ReadonlyArray<Directive>;
  readonly selectionSet: ReadonlyArray<Selection>;
  readonly spread: (...directives: Array<FragmentSpreadDirective>) => TFragment;
}
