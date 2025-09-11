import {
    AutocompleteProps,
    CloseButton,
    Combobox,
    InputBase,
    Stack,
    Text,
    useCombobox,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { FC } from "react";
import { Application } from "./commons/interfaces";

export interface ApplicationAutocompleteProps extends AutocompleteProps {
    onApplicationSelected: (app: Application) => void;
    applications: Application[];
}

const ApplicationAutocomplete: FC<ApplicationAutocompleteProps> = (props) => {
    const {
        applications,
        onApplicationSelected,
        value,
        defaultValue,
        onChange,
        ...rest
    } = props;
    const combobox = useCombobox();
    const [_value, setValue] = useUncontrolled({
        value,
        defaultValue,
        finalValue: "",
        onChange,
    });

    const options = applications.map((app) => (
        <Combobox.Option
            value={app.address}
            onClick={() => {
                onApplicationSelected(app);
            }}
            key={`${app.address}-${app.rollupVersion}`}
        >
            <Stack
                gap={0}
                style={{
                    borderInlineStart:
                        ".3px solid var(--mantine-primary-color-filled)",
                }}
                px="xs"
            >
                <Text size="sm">{app.address}</Text>
                <Text size="xs" c="dimmed">
                    Rollup {app.rollupVersion}
                </Text>
            </Stack>
        </Combobox.Option>
    ));

    return (
        <Combobox
            onOptionSubmit={(optVal) => {
                setValue(optVal);
                combobox.closeDropdown();
            }}
            store={combobox}
        >
            <Combobox.Target>
                <InputBase
                    {...rest}
                    value={_value}
                    onBlur={(evt) => {
                        combobox.closeDropdown();
                        rest.onBlur?.(evt);
                    }}
                    onFocus={(evt) => {
                        combobox.openDropdown();
                        rest.onFocus?.(evt);
                    }}
                    onChange={(evt) => {
                        setValue(evt.currentTarget.value);
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                    }}
                    rightSection={
                        rest.rightSection || (
                            <CloseButton
                                aria-label="Clear application"
                                data-testid="clear-application-button"
                                onClick={() => setValue("")}
                                style={{ display: _value ? undefined : "none" }}
                            />
                        )
                    }
                />
            </Combobox.Target>

            <Combobox.Dropdown
                mah="calc(13.75rem * var(--mantine-scale))"
                style={{ overflow: "scroll" }}
            >
                <Combobox.Options>
                    {options.length === 0 ? (
                        <Combobox.Empty>No Applications found!</Combobox.Empty>
                    ) : (
                        options
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default ApplicationAutocomplete;
