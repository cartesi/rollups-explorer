import Image from "next/image";
import { FC } from "react";
import { IconProps } from "./types";

const OptimismIcon: FC<IconProps> = ({ size, ...rest }) => (
    <Image
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIj48ZyBjbGlwLXBhdGg9InVybCgjYSkiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYuMDAzIiByPSIxNiIgZmlsbD0iI0ZGMDQyMCIvPjxwYXRoIGQ9Ik0xMS4wNjggMjAuNDM2cS0xLjQ4NSAwLTIuNDMyLS42OThjLS42MjQtLjQ3Mi0uOTM3LTEuMTUtLjkzNy0yLjAyIDAtLjE4Ni4wMi0uNDA1LjA2LS42Ny4xMDYtLjU5OS4yNi0xLjMxNi40NTktMi4xNnEuODQ4LTMuNDI4IDQuMzc4LTMuNDI4Yy42MzggMCAxLjIxNi4xMDYgMS43Mi4zMjVxLjc1OC4zMSAxLjE5Ny45NS40MzguNjI4LjQzOCAxLjQ5NSAwIC4yNi0uMDYuNjU4YTI3IDI3IDAgMCAxLS40NTEgMi4xNmMtLjI5MyAxLjEzNS0uNzkgMS45OTMtMS41MDggMi41NTctLjcxMS41NTgtMS42NjguODMtMi44NjQuODNtLjE4LTEuNzk0Yy40NjQgMCAuODU2LS4xNCAxLjE4Mi0uNDEycS41LS40MDcuNzEtMS4yNjJjLjE5NC0uNzg0LjM0LTEuNDYyLjQ0LTIuMDQ3cS4wNTEtLjI2LjA1My0uNTM4LjAwMi0xLjEzNi0xLjE4My0xLjEzNi0uNjk4LjAwMi0xLjE5Ni40MTJjLS4zMjYuMjcyLS41NTguNjktLjY5OCAxLjI2MmEyNyAyNyAwIDAgMC0uNDUxIDIuMDQ3IDIuNyAyLjcgMCAwIDAtLjA1NC41MjRjLS4wMDYuNzcxLjM5OSAxLjE1IDEuMTk2IDEuMTVtNS4yODMgMS42NzVjLS4wOTQgMC0uMTYtLjAyNi0uMjEzLS4wODZxLS4wNi0uMDk5LS4wNC0uMjI2bDEuNzItOC4xMDZhLjMzLjMzIDAgMCAxIC4xNC0uMjI2LjM3LjM3IDAgMCAxIC4yNC0uMDg2aDMuMzE1cTEuMzgyLjAwMSAyLjIxOS41NzEuODQ5LjU3Ny44NSAxLjY2MS0uMDAxLjMxLS4wNzMuNjUxLS4zMDcgMS40MzQtMS4yNjIgMi4xMi0uOTM3LjY4NS0yLjU3MS42ODRoLTEuNjgxbC0uNTcyIDIuNzNhLjM2LjM2IDAgMCAxLS4xNC4yMjcuMzcuMzcgMCAwIDEtLjIzOC4wODZ6bTQuNDExLTQuNzY0Yy4zNTIgMCAuNjUxLS4wOTMuOTEtLjI4NXEuMzk4LS4yODcuNTI1LS44MjQuMDQtLjIxMS4wNC0uMzcyLS4wMDItLjM2LS4yMTMtLjU1MmMtLjEzOS0uMTMzLS4zODUtLjItLjcyNC0uMmgtMS40OTVsLS40NzEgMi4yMzN6IiBmaWxsPSIjZmZmIi8+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0iYSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgLjAwM2gzMnYzMkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg=="
        alt="The Optimism icon"
        width={size ?? 32}
        height={size ?? 32}
        {...rest}
    />
);
export default OptimismIcon;