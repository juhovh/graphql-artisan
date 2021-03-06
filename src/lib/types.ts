import { PrintOptions, printOperation } from "./printers";

export type InputType = unknown;

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
  private baseType: TName;
  private name: string;
  private type: string;
  private directives: ReadonlyArray<VariableDefinitionDirective>;
  private defaultValue?: TValue;
  constructor(
    type: TName,
    name: string,
    directives: ReadonlyArray<VariableDefinitionDirective>
  ) {
    this.baseType = type;
    this.name = name;
    this.type = `${this.baseType}!`;
    this.directives = directives;
  }
  get asArray(): VariableBuilder<TName, Array<TValue>> {
    const builder = new VariableBuilder<TName, Array<TValue>>(
      this.baseType,
      this.name,
      this.directives
    );
    builder.type = `[${this.type}]!`;
    return builder;
  }
  get nullable(): VariableBuilder<TName, TValue | undefined> {
    const builder = new VariableBuilder<TName, TValue | undefined>(
      this.baseType,
      this.name,
      this.directives
    );
    if (this.type.substr(this.type.length - 1) === "!") {
      builder.type = this.type.substr(0, this.type.length - 1);
    }
    return builder;
  }
  getDefinition(defaultValue?: TValue): VariableDefinition<TName, TValue> {
    this.defaultValue = defaultValue;
    return {
      type: this.type,
      name: this.name,
      directives: this.directives,
      defaultValue: this.defaultValue,
      getVariable: () => new Variable<TName, TValue>(this.name)
    } as VariableDefinition<TName, TValue>;
  }
}

export interface VariableDefinition<TName extends string, TValue> {
  readonly __VariableDefinition: unknown;
  readonly type: string;
  readonly name: string;
  readonly directives: ReadonlyArray<VariableDefinitionDirective>;
  readonly defaultValue?: TValue;
  readonly getVariable: () => Variable<TName, TValue>;
}

export class Variable<TName extends string, TValue> {
  readonly __VariableType: TName | undefined;
  readonly __VariableValue: TValue | undefined;
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
