/**
 * Content/copy for foreclose related messages.
 */
export const forecloseMessages = {
    confirmation: {
        title: "Are you sure you want to foreclose?",
        description:
            "It is an irreversible action that prevents any further deposits or inputs to the application.",
    },
    sendTooltip:
        "The application is foreclosed. You can no longer send transactions.",

    foreclosingWarning: "Foreclosing an application is a permanent action.",
    generic: {
        txSuccess: "Application foreclosed successfully!",
    },
    feedback: {
        applicationForeclosed:
            "The application is already foreclosed. You cannot foreclose it again.",
    },
    forecloseTxt: "Foreclose",
    foreclosedTxt: "Foreclosed",
    application: {
        isForeclosed: "This application is foreclosed.",
    },
} as const;
