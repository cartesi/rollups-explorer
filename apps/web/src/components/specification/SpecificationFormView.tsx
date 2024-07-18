"use client";
import {
    Center,
    Flex,
    Grid,
    GridCol,
    SegmentedControl,
    Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { propOr } from "ramda";
import { isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useCallback, useState } from "react";
import { TbLayoutColumns, TbLayoutList } from "react-icons/tb";
import { DecodingPreview } from "./components/DecodingPreview";
import { SpecificationForm } from "./form/SpecificationForm";
import { SpecFormProvider, SpecFormValues, useSpecForm } from "./form/context";
import {
    specABIValidation,
    specAbiParamValidation,
    specConditionalsValidation,
    specEncodedDataValidation,
    specModeValidation,
    specNameValidation,
    specSliceInstructionsValidation,
} from "./form/validations";
import { JSON_ABI, Specification } from "./types";

type Layout = "split_screen" | "stack_screen";
const getInitialValues = (spec?: Specification): SpecFormValues => {
    const values: SpecFormValues = {
        formMode: isNilOrEmpty(spec) ? "CREATION" : "EDITION",
        name: propOr("", "name", spec),
        mode: propOr(JSON_ABI, "mode", spec),
        conditionals: propOr([], "conditionals", spec),
        conditionalsOn: isNotNilOrEmpty(propOr([], "conditionals", spec)),
        abi: propOr(undefined, "abi", spec),
        abiParams: propOr([], "abiParams", spec),
        sliceInstructions: propOr([], "sliceInstructions", spec),
        sliceInstructionsOn: isNotNilOrEmpty(
            propOr([], "sliceInstructions", spec),
        ),
        sliceTarget: propOr(undefined, "sliceTarget", spec),
        editingData: isNotNilOrEmpty(spec)
            ? { originalSpec: spec! }
            : undefined,
    };
    return values;
};

interface ViewProps {
    specification?: Specification;
}

export const SpecificationFormView: FC<ViewProps> = ({ specification }) => {
    const router = useRouter();
    const [layout, setLayout] = useState<Layout>("split_screen");
    const colSpan = layout === "split_screen" ? 6 : 12;
    const form = useSpecForm({
        initialValues: getInitialValues(specification),
        validate: {
            name: specNameValidation,
            mode: specModeValidation,
            abi: specABIValidation,
            abiParams: specAbiParamValidation,
            sliceInstructions: specSliceInstructionsValidation,
            conditionals: specConditionalsValidation,
            encodedData: specEncodedDataValidation,
        },
    });
    const { formMode } = form.getTransformedValues();

    const onSuccess = useCallback(
        (spec: Specification) => {
            const isEditionMode = formMode === "EDITION";
            const action = isEditionMode ? "Updated!" : "Saved!";
            const message = `Specification ${spec.name} ${action}`;
            notifications.show({
                color: "green",
                title: "Success!",
                withBorder: true,
                withCloseButton: true,
                message,
            });

            if (isEditionMode) router.push("/specifications");
        },
        [formMode, router],
    );

    const onFailure = useCallback((reason: Error) => {
        notifications.show({
            color: "red",
            title: "Oops!",
            message: reason.message ?? "Something went wrong!",
            withBorder: true,
            withCloseButton: true,
        });
    }, []);

    return (
        <Stack>
            <Flex justify="flex-start">
                <SegmentedControl
                    data-testid="specification-creation-view-switch"
                    value={layout}
                    onChange={(value) => {
                        setLayout(value as Layout);
                    }}
                    data={[
                        {
                            value: "split_screen",
                            label: (
                                <Center style={{ gap: 10 }}>
                                    <TbLayoutColumns size={18} />
                                    <span>Split View</span>
                                </Center>
                            ),
                        },
                        {
                            value: "stack_screen",
                            label: (
                                <Center style={{ gap: 10 }}>
                                    <TbLayoutList size={18} />
                                    <span>List View</span>
                                </Center>
                            ),
                        },
                    ]}
                />
            </Flex>
            <SpecFormProvider form={form}>
                <Grid>
                    <GridCol span={colSpan}>
                        <SpecificationForm
                            onSuccess={onSuccess}
                            onFailure={onFailure}
                        />
                    </GridCol>
                    <GridCol span={colSpan}>
                        <DecodingPreview />
                    </GridCol>
                </Grid>
            </SpecFormProvider>
        </Stack>
    );
};
