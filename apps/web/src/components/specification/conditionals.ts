import {
    allPass,
    anyPass,
    complement,
    equals,
    isEmpty,
    isNil,
    isNotNil,
    path,
    pathOr,
    pipe,
    thunkify,
} from "ramda";
import { Input } from "../../graphql/explorer/types";
import { Condition, Predicate, Specification } from "./types";

/**
 * Conditional typing to create a duck typing situation
 * with generated graphql types. For flexibility sake but still with autocompletion.
 */
type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

type MaybeInput = DeepPartial<Input>;

interface MatchEnvelope {
    input: MaybeInput;
    specs: Specification[];
}

type MatchResult = Specification | undefined;

type Matcher = (
    input: MaybeInput,
    specifications: Specification[],
) => Specification | null;

const isNotNilOrEmpty = allPass([isNotNil, complement(isEmpty)]);

const filterSpecsWithoutConditions = (me: MatchEnvelope): MatchEnvelope => {
    const newList = me.specs.filter((spec) =>
        isNotNilOrEmpty(spec.conditionals),
    );
    return { ...me, specs: newList };
};

const operators = {
    equals,
};

const logicalOperators = {
    and: allPass,
    or: anyPass,
};

/**
 * Map of conditional fields/etc to be replaced on the fly.
 */
const patcheables = {
    "application.id": "application.address",
} as const;

export const patchField = (value: Condition["field"]) =>
    pathOr(value, [value], patcheables);

/**
 * Return a list of lazy functions to be evaluated later as parameters for Logical Operators e.g. or(fn1, fn2)()
 * @param conditions
 * @param input
 * @returns
 */
const buildConditions = (conditions: Condition[], input: MaybeInput) => {
    return conditions.map((condition) => {
        const inputValue = path(patchField(condition.field)?.split("."), input);
        const operatorFn = operators[condition.operator];
        return thunkify(operatorFn)(inputValue, condition.value);
    });
};

const buildExpression = (predicates: Predicate[], input: MaybeInput) => {
    const expressions = predicates.map((predicate) => {
        const logicalOperator = logicalOperators[predicate.logicalOperator];
        const conditions = buildConditions(predicate.conditions, input);
        return logicalOperator(conditions);
    });

    return anyPass(expressions);
};

const match = (me: MatchEnvelope): Specification | null => {
    for (let i = 0; i < me.specs.length; i++) {
        const spec = me.specs[i];
        const executableExpression = buildExpression(
            spec.conditionals!,
            me.input,
        );

        if (executableExpression() === true) {
            return spec;
        }
    }

    return null;
};

const isNilOrEmpty = anyPass([isNil, isEmpty]);

/**
 * Return the first specification which the conditional defined evaluate to true.
 * Note: that this is short-circuited, meaning it will stop iterating over the specification list after a match.
 * @param input
 * @param specifications
 * @returns
 */
export const findSpecificationFor: Matcher = (input, specifications) => {
    if (isNilOrEmpty(input) || isNilOrEmpty(specifications)) return null;

    const envelope: MatchEnvelope = { input, specs: specifications };

    return pipe(filterSpecsWithoutConditions, match)(envelope);
};
