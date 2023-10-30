import { MantineThemeOverride, Modal, createTheme } from "@mantine/core";

export const theme: MantineThemeOverride = createTheme({
    fontFamily: "Open Sans, sans-serif",
    primaryColor: "cyan",
    components: {
        Modal: Modal.extend({
            defaultProps: {
                size: "lg",
                centered: true,
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
            },
        }),
    },
});
