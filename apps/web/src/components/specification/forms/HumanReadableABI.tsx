import {
    ActionIcon,
    Button,
    Card,
    Group,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { isEmpty, isNotNil, reject } from "ramda";
import { FC, useEffect, useReducer, useRef } from "react";
import { TbTrash } from "react-icons/tb";
import { parseAbiParameters } from "viem";
import { useSpecFormContext } from "../formContext";

type AddEntry = {
    type: "ADD_ENTRY";
    payload: string;
};

type RemoveEntry = {
    type: "REMOVE_ENTRY";
    payload: string;
};

interface State {
    entries: string[];
    error: Error | null;
}

type Action = AddEntry | RemoveEntry;

type Reducer = (state: State, action: Action) => State;

const checkError = (entries: string[]) => {
    try {
        parseAbiParameters(entries);
        return null;
    } catch (error: any) {
        return error;
    }
};

const reducer: Reducer = (state, action) => {
    let entries = state.entries;
    if (action.type === "ADD_ENTRY") {
        entries = [...state.entries, action.payload];
    }

    if (action.type === "REMOVE_ENTRY") {
        entries = reject((v) => v === action.payload, state.entries);
    }

    return {
        ...state,
        entries,
        error: checkError(entries),
    };
};

const initialState = {
    entries: [],
    error: null,
};

export const HumanReadableABI: FC = () => {
    const form = useSpecFormContext();
    const ref = useRef<HTMLInputElement>(null);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { entries, error } = state;

    const addABIParam = () => {
        const entry = form.getInputProps("abiParamEntry").value;

        if (isNotNil(entry) && !isEmpty(entry)) {
            dispatch({ type: "ADD_ENTRY", payload: entry });
            form.setFieldValue("abiParamEntry", "");
            ref.current?.focus();
        }
    };

    const removeABIParam = (entry: string) => {
        dispatch({ type: "REMOVE_ENTRY", payload: entry });
        ref.current?.focus();
    };

    useEffect(() => {
        form.setFieldValue("abiParams", [...entries]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries]);

    return (
        <Stack>
            <TextInput
                ref={ref}
                label="ABI Parameter"
                description="Human readable ABI format"
                placeholder="address to, uint256 amount, bool succ"
                rightSectionWidth="lg"
                {...form.getInputProps("abiParamEntry")}
                rightSection={<Button onClick={addABIParam}>Add</Button>}
            />

            {entries.length > 0 && (
                <Stack gap="xs" pl="sm">
                    {entries.map((entry, idx) => (
                        <Card
                            key={idx}
                            p="xs"
                            style={{ borderColor: error ? "red" : "" }}
                        >
                            <Group
                                justify="space-between"
                                align="center"
                                wrap="nowrap"
                            >
                                <Text fw="bold" pl="sm">
                                    {entry}
                                </Text>
                                <ActionIcon
                                    variant="transparent"
                                    color="red"
                                    onClick={() => removeABIParam(entry)}
                                >
                                    <TbTrash size={21} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    ))}
                    {error && <Text c="red">{error.message}</Text>}
                </Stack>
            )}
        </Stack>
    );
};
