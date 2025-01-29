"use client";

import { InitialLogo } from "../cartesiLogo";
import { useMounted } from "@mantine/hooks";

export const InitialPageLogo = () => {
    const isMounted = useMounted();

    return isMounted ? null : (
        <div
            style={{
                position: "absolute",
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <InitialLogo color="#00f7ff" height={40} />
        </div>
    );
};
