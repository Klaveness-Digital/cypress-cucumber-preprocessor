export interface IParameterTypeDefinition<T> {
  name: string;
  regexp: RegExp;
  transformer: (this: Mocha.Context, ...match: string[]) => T;
}

export interface IHookBody {
  (this: Mocha.Context): void;
}

export interface IStepDefinitionBody<T extends unknown[]> {
  (this: Mocha.Context, ...args: T): void;
}

export type YieldType<T extends Generator> = T extends Generator<infer R>
  ? R
  : never;
