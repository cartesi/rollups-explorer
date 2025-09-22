import { Alert, Collapse, Loader, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { isNotNil } from "ramda";
import { FC, useEffect, useState } from "react";
import { TbAlertCircle } from "react-icons/tb";
import {
    Hex,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount } from "wagmi";
import ApplicationAutocomplete from "../ApplicationAutocomplete";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import RollupVersionSegment from "../RollupVersionSegment";
import { Application, RollupVersion } from "../commons/interfaces";
import { useAccountBalance } from "../hooks/useAccountBalance";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import EtherDepositSection from "./EtherDepositSection";
import { FormValues, TransformValues } from "./types";

export interface EtherDepositFormProps {
    applications: Application[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const EtherDepositForm: FC<EtherDepositFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;

    const [userSelectedAppVersion, setUserSelectedAppVersion] = useState<
        RollupVersion | undefined
    >();

    const { chain } = useAccount();
    const accountBalance = useAccountBalance();

    const form = useForm<FormValues, TransformValues>({
        validateInputOnChange: true,
        initialValues: {
            accountBalance: accountBalance,
            application: "",
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

    const { address } = form.getTransformedValues();
    const appAddressList = applications.map((app) => app.address);
    const isUndeployedApp = useUndeployedApplication(address, appAddressList);

    const hasFoundOneApp = applications.length === 1;
    const app = hasFoundOneApp ? applications[0] : undefined;
    const appVersion = app?.rollupVersion || userSelectedAppVersion;

    const onDepositSuccess = (data: TransactionFormSuccessData) => {
        onSuccess(data);
        form.reset();
        setUserSelectedAppVersion(undefined);
        onSearchApplications("");
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
                <ApplicationAutocomplete
                    label="Application"
                    description="The application smart contract address"
                    data-testid="application-input"
                    placeholder="0x"
                    applications={applications}
                    withAsterisk
                    rightSection={isLoadingApplications && <Loader size="xs" />}
                    {...form.getInputProps("application")}
                    error={form.errors?.application}
                    onChange={(nextValue) => {
                        form.setFieldValue("application", nextValue);
                        onSearchApplications(nextValue);
                    }}
                    onApplicationSelected={(app) => {
                        form.setFieldValue("application", app.address);
                        onSearchApplications(app.address, app.rollupVersion);
                    }}
                />

                {!form.errors.application && isUndeployedApp && (
                    <>
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is a deposit to an undeployed application.
                        </Alert>

                        <RollupVersionSegment
                            label="Cartesi Rollups version"
                            description="Set the rollup version to call the correct contracts."
                            onChange={setUserSelectedAppVersion}
                            value={userSelectedAppVersion ?? ""}
                            onUnmount={() => {
                                setUserSelectedAppVersion(undefined);
                            }}
                        />
                    </>
                )}

                {appVersion && (
                    <Collapse
                        in={isNotNil(appVersion) && !isLoadingApplications}
                    >
                        <EtherDepositSection
                            appVersion={appVersion}
                            form={form}
                            onSuccess={onDepositSuccess}
                        />
                    </Collapse>
                )}
            </Stack>
        </form>
    );
};
