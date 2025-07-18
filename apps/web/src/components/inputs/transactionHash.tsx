import React, { FC } from "react";
import { shortenHash } from "../../utils/text";
import { Flex, Text } from "@mantine/core";
import { BlockExplorerLink } from "../BlockExplorerLink";
import CopyButton from "../copyButton";

interface TransactionHashProps {
    transactionHash: string;
}

const TransactionHash: FC<TransactionHashProps> = ({ transactionHash }) => {
    const Link = BlockExplorerLink({
        value: transactionHash,
        type: "tx",
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
