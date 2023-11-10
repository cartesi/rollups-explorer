"use client";
import { ERC20DepositForm, RawInputForm } from "@cartesi/rollups-explorer-ui";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, ReactNode } from "react";
import { useApplicationsQuery, useTokensQuery } from "../graphql";

interface DepositFormsContainerProps {
    renderERC20DepositForm: (Form: ReactNode) => ReactNode;
    renderRawInputForm: (Form: ReactNode) => ReactNode;
}

const DepositFormsContainer: FC<DepositFormsContainerProps> = (props) => {
    const { renderERC20DepositForm, renderRawInputForm } = props;
    const [{ data: applicationData }] = useApplicationsQuery({
        variables: {
            limit: 1000,
        },
    });
    const applications = (applicationData?.applications ?? []).map((a) => a.id);
    const [{ data: tokenData }] = useTokensQuery({
        variables: {
            limit: 1000,
        },
    });
    const tokens = (tokenData?.tokens ?? []).map(
        (a) => `${a.symbol} - ${a.name} - ${a.id}`,
    );

    return (
        <>
            {renderERC20DepositForm(
                <ERC20DepositForm
                    applications={applications}
                    tokens={tokens}
                />,
            )}
            {renderRawInputForm(<RawInputForm applications={applications} />)}
        </>
    );
};
export default DepositFormsContainer;
