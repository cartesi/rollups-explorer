"use client";
import { createFormContext } from "@mantine/form";
import type { FormTransformedValues, FormValues } from "./types";

type TransformValues = (a: FormValues) => FormTransformedValues;

export const [FormProvider, useFormContext, useForm] = createFormContext<
    FormValues,
    TransformValues
>();
