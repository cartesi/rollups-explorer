import { InitialLogo } from "../cartesiLogo";

export const InitialPageLogo = () => {
    return (
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
