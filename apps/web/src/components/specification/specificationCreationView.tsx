"use client";
import {
    Center,
    Flex,
    Grid,
    GridCol,
    SegmentedControl,
    Stack,
} from "@mantine/core";
import { isEmpty, isNil } from "ramda";
import { useState } from "react";
import { TbLayoutColumns, TbLayoutList } from "react-icons/tb";
import { Hex } from "viem";
import { SpecFormProvider, useSpecForm } from "./form/context";
import {
    specABIValidation,
    specAbiParamValidation,
    specConditionalsValidation,
    specEncodedDataValidation,
    specModeValidation,
    specNameValidation,
    specSliceInstructionsValidation,
} from "./form/validations";
import { DecodingPreview, SpecificationForm } from "./specificationForm";

type Layout = "split_screen" | "stack_screen";

const toJSON = (value: string) => {
    if (isNil(value) || isEmpty(value)) return [];

    try {
        return JSON.parse(value);
    } catch (error) {
        console.error((error as TypeError).message);
        return [];
    }
};

export const SpecificationCreationView = () => {
    const [layout, setLayout] = useState<Layout>("split_screen");
    const colSpan = layout === "split_screen" ? 6 : 12;
    const form = useSpecForm({
        initialValues: {
            mode: "json_abi",
            name: "",
            abiParams: [],
            encodedData: "" as Hex,
            abi: undefined,
            conditionals: [],
            sliceInstructions: [],
            conditionalsOn: false,
            sliceInstructionsOn: false,
        },
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
                        <SpecificationForm />
                    </GridCol>
                    <GridCol span={colSpan}>
                        <DecodingPreview />
                    </GridCol>
                </Grid>
            </SpecFormProvider>
        </Stack>
    );
};
