import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { find, isNil, reject } from "ramda";
import { isFunction } from "ramda-adjunct";
import { useEffect } from "react";
import { Specification } from "../types";
import localRepository from "./localRepository";

type ActionLifecycle = {
    onSuccess?: () => void;
    onFailure?: (reason?: any) => void;
    onFinished?: () => void;
};

const repositoryAtom = atom(localRepository);
const loadSpecificationAtom = loadable(
    atom(async (get) => {
        return await get(repositoryAtom).list();
    }),
);

const specificationsAtom = atom<Specification[] | undefined>(undefined);

const addSpecificationAtom = atom(
    null,
    (get, set, action: { spec: Specification; opt: ActionLifecycle }) => {
        const repository = get(repositoryAtom);
        const specs = get(specificationsAtom) ?? [];
        repository
            .add(action.spec)
            .then((newSpec) => {
                set(specificationsAtom, [...specs, newSpec]);
                isFunction(action.opt.onSuccess) && action.opt.onSuccess();
            })
            .catch((reason: Error) => {
                console.log(`Failed to add specification: ${reason.message}`);
                isFunction(action.opt.onFailure) &&
                    action.opt.onFailure(reason);
            })
            .finally(
                () =>
                    isFunction(action.opt.onFinished) &&
                    action.opt.onFinished(),
            );
    },
);

const removeSpecificationAtom = atom(
    null,
    (get, set, action: { id: string; opt: ActionLifecycle }) => {
        const repository = get(repositoryAtom);
        const specs = get(specificationsAtom) ?? [];
        repository
            .remove(action.id)
            .then(() => {
                set(
                    specificationsAtom,
                    reject((spec) => spec.id === action.id, specs),
                );
                isFunction(action.opt.onSuccess) && action.opt.onSuccess();
            })
            .catch((reason: Error) => {
                console.log(
                    `Failed to remove specification: ${reason.message}`,
                );
                isFunction(action.opt.onFailure) &&
                    action.opt.onFailure(reason);
            })
            .finally(
                () =>
                    isFunction(action.opt.onFinished) &&
                    action.opt.onFinished(),
            );
    },
);

const useActions = () => {
    const addSpecification = useSetAtom(addSpecificationAtom);
    const removeSpecification = useSetAtom(removeSpecificationAtom);

    const actions = {
        addSpecification(spec: Specification, opt?: ActionLifecycle) {
            addSpecification({ spec, opt: { ...opt } });
        },
        removeSpecification(id: string, opt?: ActionLifecycle) {
            removeSpecification({ id, opt: { ...opt } });
        },
    };

    return actions;
};

export const useSpecification = () => {
    const [specifications, setSpecifications] = useAtom(specificationsAtom);
    const { addSpecification, removeSpecification } = useActions();
    const value = useAtomValue(loadSpecificationAtom);
    const fetching = value.state === "loading";

    const getSpecification = (id: string) =>
        find((val) => val.id === id, specifications ?? []);

    const hasSpecification = (id: string) => getSpecification(id) !== undefined;
    const listSpecifications = () => specifications;

    useEffect(() => {
        if (isNil(specifications) && value.state === "hasData") {
            setSpecifications(value.data);
        }
    }, [setSpecifications, value, specifications]);

    return {
        fetching,
        listSpecifications,
        addSpecification,
        removeSpecification,
        getSpecification,
        hasSpecification,
    };
};
