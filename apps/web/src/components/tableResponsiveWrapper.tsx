import { Box, Flex } from "@mantine/core";
import { forwardRef, ForwardRefRenderFunction, ReactNode } from "react";

interface TableResponsiveWrapperProps {
    children: ReactNode;
}

const TableResponsiveWrapper: ForwardRefRenderFunction<
    HTMLDivElement,
    TableResponsiveWrapperProps
> = ({ children }, ref) => {
    return (
        <Flex direction="column" align="center" w="100%">
            <Flex direction="column" align="center" w="100%">
                <Box ref={ref} style={{ position: "relative", width: "100%" }}>
                    <Box style={{ overflowX: "auto", width: "100%" }}>
                        {children}
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};

export default forwardRef(TableResponsiveWrapper);
