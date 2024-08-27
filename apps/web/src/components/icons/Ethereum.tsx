import Image from "next/image";
import { FC } from "react";
import { IconProps } from "./types";

const EthereumIcon: FC<IconProps> = ({ size, ...rest }) => (
    <Image
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzY2ODBFMyIvPjxwYXRoIGQ9Im05IDE2LjIxIDYuOTk2IDQuMTRWNC41OTV6IiBmaWxsPSIjZmZmIi8+PHBhdGggb3BhY2l0eT0iLjgiIGQ9Ik0xNS45OTYgNC41OTZ2MTUuNzUzTDIzIDE2LjIxMXoiIGZpbGw9IiNDMkNDRjQiLz48cGF0aCBkPSJtOSAxNy41NDIgNi45OTYgOS44NjJ2LTUuNzMyeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNS45OTYgMjEuNjcydjUuNzMyTDIzIDE3LjU0MnoiIGZpbGw9IiNDMkNDRjQiLz48cGF0aCBkPSJNMTUuOTk2IDEzLjAzMyA5IDE2LjIxMWw2Ljk5NiA0LjEzOEwyMyAxNi4yMTF6IiBmaWxsPSIjODU5OUU4IiBmaWxsLW9wYWNpdHk9Ii40NyIvPjwvc3ZnPg=="
        alt="The Ethereum icon"
        width={size ?? 32}
        height={size ?? 32}
        {...rest}
    />
);
export default EthereumIcon;
