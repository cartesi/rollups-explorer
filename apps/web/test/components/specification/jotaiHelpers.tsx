import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { FC, ReactNode } from "react";

type HydrateAtomsProps = { initialValues: any; children: ReactNode };

const HydrateAtoms: FC<HydrateAtomsProps> = ({ initialValues, children }) => {
    useHydrateAtoms(initialValues);
    return children;
};

export const JotaiTestProvider: FC<HydrateAtomsProps> = ({
    initialValues,
    children,
}) => (
    <Provider>
        <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
);
