import { FC, FunctionComponent } from "react";
import WalletProvider from "../../src/providers/walletProvider";

export const withWagmiProvider = <T,>(
    Component: FunctionComponent<T>,
): FC<T> => {
    const NewComp: FC<T> = (props: T) => (
        <WalletProvider>
            {/* @ts-ignore */}
            <Component {...props} />
        </WalletProvider>
    );

    NewComp.displayName = Component.displayName;

    return NewComp;
};

export default withWagmiProvider;
