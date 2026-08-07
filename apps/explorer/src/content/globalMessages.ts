/**
 * Generic messages that can be used across the application.
 */
export const globalMessages = {
    alert: {
        error: "Error!",
        success: "Success!",
        warning: "Warning!",
        info: "Info!",
        reminder: "Remember!",
    },
    error: {
        generic: "Something went wrong.",
    },
    format: {
        short: "Short format",
        long: "Long format",
    },
    decoded: {
        show: "Show Decoded",
        hide: "Hide Decoded",
    },
    btn: {
        send: "Send",
        cancel: "Cancel",
        confirm: "Confirm",
        close: "Close",
        connectWallet: "Connect Wallet",
    },
    application: {
        address: "Application Address",
    },
} as const;
