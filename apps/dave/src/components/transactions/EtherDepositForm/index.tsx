"use client";
import { type Application } from "@cartesi/viem";
import { etherPortalAddress } from "@cartesi/wagmi";
import {
    Badge,
    Collapse,
    Fieldset,
    Stack,
    Switch,
    Text,
    VisuallyHidden,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { type FC, useEffect } from "react";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import {
    type Hex,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount } from "wagmi";
import { type TransactionFormSuccessData } from "../DepositFormTypes";
import { useAccountBalance } from "../hooks/useAccountBalance";
import EtherDepositSection from "./EtherDepositSection";
import { type FormValues, type TransformValues } from "./types";

interface EthDepositFormProps {
    application: Application;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const EtherDepositForm: FC<EthDepositFormProps> = (props) => {
    const { application, onSuccess } = props;
    const { chain } = useAccount();
    const [showDetails, handlers] = useDisclosure(false);
    const accountBalance = useAccountBalance();

    const form = useForm<FormValues, TransformValues>({
        validateInputOnChange: true,
        initialValues: {
            accountBalance: accountBalance,
            application: application.applicationAddress,
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) => {
                return value !== "" && isAddress(value)
                    ? null
                    : "Invalid application address";
            },
            amount: (value, values) => {
                if (value !== "" && Number(value) > 0) {
                    const val = parseUnits(
                        value,
                        values.accountBalance.decimals,
                    );
                    if (val > values.accountBalance.value) {
                        return `The amount ${value} exceeds your current balance of ${values.accountBalance.formatted} ETH`;
                    }

                    return null;
                } else {
                    return "Invalid amount";
                }
            },
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            amount:
                values.amount !== ""
                    ? parseUnits(
                          values.amount,
                          chain?.nativeCurrency.decimals ?? 18,
                      )
                    : undefined,
            execLayerData: values.execLayerData
                ? (values.execLayerData as Hex)
                : "0x",
        }),
    });

    const onDepositSuccess = (data: TransactionFormSuccessData) => {
        onSuccess(data);
        form.reset();
        accountBalance.refetch();
    };

    useEffect(() => {
        form.setValues({ accountBalance: accountBalance });

        if (form.isDirty("amount")) {
            form.validateField("amount");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps -- 'form' is not added on purpose because it has unstable reference
    }, [accountBalance]);

    return (
        <form data-testid="ether-deposit-form">
            <Stack>
                <Switch
                    size="md"
                    label="Tx details"
                    labelPosition="left"
                    checked={showDetails}
                    onChange={handlers.toggle}
                    onLabel={
                        <>
                            <VisuallyHidden>Tx Details Visible</VisuallyHidden>
                            <TbEye size="1rem" />
                        </>
                    }
                    offLabel={
                        <>
                            <VisuallyHidden>Tx Details Hidden</VisuallyHidden>

                            <TbEyeClosed size="1rem" />
                        </>
                    }
                />
                <Collapse in={showDetails}>
                    <Stack gap="xs" style={{ overflowWrap: "break-word" }}>
                        <Fieldset legend={<Badge>Application Address</Badge>}>
                            <Text c="dimmed">
                                {application.applicationAddress}
                            </Text>
                        </Fieldset>
                        <Fieldset legend={<Badge>Portal Address</Badge>}>
                            <Text c="dimmed">{etherPortalAddress}</Text>
                        </Fieldset>
                    </Stack>
                </Collapse>
                <EtherDepositSection form={form} onSuccess={onDepositSuccess} />
            </Stack>
        </form>
    );
};
