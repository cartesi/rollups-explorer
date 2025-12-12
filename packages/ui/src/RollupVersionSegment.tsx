import {
    MantineSpacing,
    SegmentedControl,
    SegmentedControlProps,
    Stack,
    Text,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { FC, useEffect } from "react";
import { RollupVersion } from "./commons/interfaces";

export interface RollupVersionSegmentProps extends Omit<
    SegmentedControlProps,
    "onChange" | "data"
> {
    gap?: MantineSpacing;
    label?: string;
    description?: string;
    onChange: (v: RollupVersion) => void;
    onUnmount?: () => void;
}

const RollupVersionSegment: FC<RollupVersionSegmentProps> = (props) => {
    const {
        value,
        defaultValue,
        onChange,
        onUnmount,
        gap,
        label,
        description,
        ...rest
    } = props;

    const _description =
        description ?? "Set the rollup version to call the correct contracts.";
    const _label = label ?? "Cartesi Rollups version";

    const [_value, setValue] = useUncontrolled({
        value: value as RollupVersion,
        defaultValue: defaultValue as RollupVersion,
        finalValue: undefined,
        onChange,
    });

    useEffect(() => {
        return () => {
            onUnmount?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Stack gap={gap ?? 5}>
            <Stack gap="0">
                <Text
                    id="app-version-label"
                    component="label"
                    aria-required="true"
                    fz="sm"
                >
                    {_label}
                </Text>

                <Text size="xs" c="dimmed">
                    {_description}
                </Text>
            </Stack>
            <SegmentedControl
                size="sm"
                {...rest}
                aria-labelledby="app-version-label"
                aria-label="Choose the Rollup version"
                data={[
                    { value: "v1", label: "Rollup v1" },
                    { value: "v2", label: "Rollup v2" },
                ]}
                value={_value}
                onChange={(value) => {
                    setValue(value as RollupVersion);
                }}
            />
        </Stack>
    );
};

export default RollupVersionSegment;
