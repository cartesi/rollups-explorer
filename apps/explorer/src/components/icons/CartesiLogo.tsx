import {
    cartesiLogoDarkDataUri,
    cartesiLogoLightDataUri,
} from "@cartesi/brand/logos";
import { Box, Image } from "@mantine/core";
import type { FC } from "react";

type CartesiLogoProps = {
    height?: number;
};

const CartesiLogo: FC<CartesiLogoProps> = ({ height }) => (
    <Box h={height}>
        <Image
            src={cartesiLogoLightDataUri}
            alt="Cartesi"
            h={height}
            w="auto"
            darkHidden
        />
        <Image
            src={cartesiLogoDarkDataUri}
            alt="Cartesi"
            h={height}
            w="auto"
            lightHidden
        />
    </Box>
);

export default CartesiLogo;
