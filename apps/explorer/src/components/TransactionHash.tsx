import { Flex, Text } from "@mantine/core";
import { type FC } from "react";
import { useConfig } from "wagmi";
import { shortenHash } from "../lib/textUtils";
import { BlockExplorerLink } from "./BlockExplorerLink";
import CopyButton from "./CopyButton";

interface TransactionHashProps {
    transactionHash: string;
}

const TransactionHash: FC<TransactionHashProps> = ({ transactionHash }) => {
    const config = useConfig();

    const Link = BlockExplorerLink({
        value: transactionHash,
        type: "tx",
        chain: config.chains[0],
    });

    return (
        <Flex align="center">
            {Link === null ? (
                <Text>{shortenHash(transactionHash)}</Text>
            ) : (
                <>{Link}</>
            )}{" "}
            <CopyButton value={transactionHash} />
        </Flex>
    );
};

export default TransactionHash;
