import { isNilOrEmpty } from "ramda-adjunct";
import { FilterVersion } from "../components/versionsFilter";

export const shortenHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

export const splitString = <T>(value: string, separator = ",") => {
    return (
        isNilOrEmpty(value) ? [] : (value.split(separator) as FilterVersion[])
    ) as T[];
};
