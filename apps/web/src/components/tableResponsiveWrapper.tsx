import { Box, Flex } from "@mantine/core";
import { forwardRef } from "react";
type TableResponsiveWrapperProps = {
    children: React.ReactNode;
};

type Ref = HTMLDivElement;
const Component = (props: any, ref: any) => {
    const { children, ...restProps } = props;
    return (
        <Flex w="100%" align={"center"} direction={"column"}>
            <Flex w="100%" align={"center"} direction={"column"}>
                <Box style={{ position: "relative", width: "100%" }} ref={ref}>
                    <Box style={{ overflowX: "auto", width: "100%" }}>
                        {children}
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
};

export const TableResponsiveWrapper = forwardRef<
    Ref,
    TableResponsiveWrapperProps
>(Component);
