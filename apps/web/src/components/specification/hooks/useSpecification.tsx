import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { find, isNil, reject } from "ramda";
import { isFunction } from "ramda-adjunct";
import { useEffect, useState } from "react";
import { Specification } from "../types";
import localRepository from "./localRepository";

interface ActionLifecycle {
    onSuccess?: () => void;
    onFailure?: (reason?: any) => void;
    onFinished?: () => void;
}

type AtomActionType = "create" | "update" | "remove";
interface AtomActionLifecycle extends ActionLifecycle {
    actionName: AtomActionType;
}

interface Action<PayloadT> {
    opt: AtomActionLifecycle;
    payload: PayloadT;
}

type AddSpecificationAction = Action<Specification>;
type RemoveSpecificationAction = Action<string>;
type UpdateSpecificationAction = AddSpecificationAction;

const catchBuilder = (opt: AtomActionLifecycle) => (reason: Error) => {
    console.error(
        `Error when trying to ${opt.actionName} specification: ${reason.message}`,
    );
    isFunction(opt.onFailure) && opt.onFailure(reason);
};

const finallyBuilder = (opt: AtomActionLifecycle) => () => {
    isFunction(opt.onFinished) && opt.onFinished();
};

export const repositoryAtom = atom(localRepository);
const loadSpecificationAtom = loadable(
    atom(async (get) => {
        return await get(repositoryAtom).list();
    }),
);

export const specificationsAtom = atom<Specification[] | undefined>(undefined);

const addSpecificationAtom = atom(
    null,
    (get, set, action: AddSpecificationAction) => {
        const repository = get(repositoryAtom);
        const specs = get(specificationsAtom) ?? [];
        repository
            .add(action.payload)
            .then((newSpec) => {
                set(specificationsAtom, [...specs, newSpec]);
                isFunction(action.opt.onSuccess) && action.opt.onSuccess();
            })
            .catch(catchBuilder(action.opt))
            .finally(finallyBuilder(action.opt));
    },
);

const updateSpecificationAtom = atom(
    null,
    (get, set, action: UpdateSpecificationAction) => {
        const repository = get(repositoryAtom);
        const specs = get(specificationsAtom) ?? [];
        repository
            .update(action.payload)
            .then((updatedSpec) => {
                const newList = specs.map((val) => {
                    return val.id === updatedSpec.id ? updatedSpec : val;
                });
                set(specificationsAtom, newList);
                isFunction(action.opt.onSuccess) && action.opt.onSuccess();
            })
            .catch(catchBuilder(action.opt))
            .finally(finallyBuilder(action.opt));
    },
);

const removeSpecificationAtom = atom(
    null,
    (get, set, action: RemoveSpecificationAction) => {
        const repository = get(repositoryAtom);
        const specs = get(specificationsAtom) ?? [];
        repository
            .remove(action.payload)
            .then(() => {
                set(
                    specificationsAtom,
                    reject((spec) => spec.id === action.payload, specs),
                );
                isFunction(action.opt.onSuccess) && action.opt.onSuccess();
            })
            .catch(catchBuilder(action.opt))
            .finally(finallyBuilder(action.opt));
    },
);

const useActions = () => {
    const addSpecification = useSetAtom(addSpecificationAtom);
    const removeSpecification = useSetAtom(removeSpecificationAtom);
    const updateSpecification = useSetAtom(updateSpecificationAtom);

    const actions = {
        addSpecification(spec: Specification, opt?: ActionLifecycle) {
            addSpecification({
                payload: spec,
                opt: { ...opt, actionName: "create" },
            });
        },
        removeSpecification(id: string, opt?: ActionLifecycle) {
            removeSpecification({
                payload: id,
                opt: { ...opt, actionName: "remove" },
            });
        },
        updateSpecification(spec: Specification, opt?: ActionLifecycle) {
            updateSpecification({
                payload: spec,
                opt: { ...opt, actionName: "update" },
            });
        },
    };

    return actions;
};
/**
 * Specifications created by users.
 * @returns
 */
export const useSpecification = () => {
    const [specifications, setSpecifications] = useAtom(specificationsAtom);
    const actions = useActions();
    const value = useAtomValue(loadSpecificationAtom);
    const [fetching, setFetching] = useState(value.state === "loading");

    const getSpecification = (id: string) =>
        find((val) => val.id === id, specifications ?? []);

    const hasSpecification = (id: string) => getSpecification(id) !== undefined;
    const listSpecifications = () => specifications;

    useEffect(() => {
        if (isNil(specifications) && value.state === "hasData") {
            setSpecifications(value.data);
        }
    }, [setSpecifications, value, specifications]);

    useEffect(() => {
        if (value.state !== "loading") {
            setFetching(false);
        }
    }, [value.state]);

    return {
        ...actions,
        fetching,
        listSpecifications,
        getSpecification,
        hasSpecification,
    };
};
