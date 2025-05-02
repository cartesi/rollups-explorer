import {
    VisuallyHidden,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { FC } from "react";
import { IconProps } from "./types";

const CannonIcon: FC<IconProps> = ({ size, ...rest }) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const color = colorScheme === "dark" ? theme.white : theme.black;
    const height = size ?? 39;
    const width = size ?? 38;

    return (
        <div style={{ display: "block", height: size, color }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox={`0 0 39 38`}
                color={color}
                role="img"
                aria-label="The Cannon icon"
            >
                <VisuallyHidden>The Cannon icon</VisuallyHidden>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.58259 33.0153C-1.62287 25.8642 -0.749215 14.5544 6.32102 8.36052C7.53945 20.9563 17.574 30.9972 30.2506 32.4752C23.9738 39.3147 12.7215 40.1004 5.58259 33.0153ZM33.4361 27.4467C33.0328 28.4265 32.5529 29.3431 32.0071 30.1941C19.2652 29.4555 9.1046 19.2666 8.65638 6.64662C9.44808 6.16398 10.2943 5.73635 11.1936 5.37177L21.5257 1.18274C26.1376 -0.687096 31.4296 0.370916 34.9523 3.86707C38.475 7.36322 39.541 12.6153 37.657 17.1924L33.4361 27.4467ZM24.5222 3.80625C24.5222 3.80625 24.6889 8.31535 27.594 11.1985C30.4991 14.0817 35.0424 14.2471 35.0424 14.2471C35.0424 14.2471 35.2597 9.35695 32.3547 6.47378C29.4496 3.59061 24.5222 3.80625 24.5222 3.80625Z"
                    fill="currentColor"
                />
            </svg>
        </div>
    );
};

export default CannonIcon;
