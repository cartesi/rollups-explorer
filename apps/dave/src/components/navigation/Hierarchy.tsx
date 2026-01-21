import {
    Anchor,
    Breadcrumbs,
    Button,
    Container,
    Group,
    Menu,
    MenuDropdown,
    MenuItem,
    MenuTarget,
    Text,
    useMantineTheme,
    type BreadcrumbsProps,
} from "@mantine/core";
import Link from "next/link";
import { slice } from "ramda";
import type { FC, ReactNode } from "react";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";

export type HierarchyConfig = {
    title: ReactNode;
    href: string;
};

type HierarchyProps = {
    separator?: string;
    hierarchyConfig: HierarchyConfig[];
    breadcrumbOpts?: BreadcrumbsProps;
};

type ShortFormatProps = {
    configs: HierarchyConfig[];
    visibleQuantity?: number;
    separator?: string;
};

const ShortFormat: FC<ShortFormatProps> = ({
    configs,
    visibleQuantity = 2,
    separator = "/",
}) => {
    visibleQuantity = visibleQuantity < 2 ? 2 : visibleQuantity;
    const configSize = configs.length;
    const configsAsMenu = slice(0, -visibleQuantity, configs);
    const fullDisplayConfigs = slice(
        configSize - visibleQuantity,
        configSize,
        configs,
    );

    const lastFullDisplayConfigItem = fullDisplayConfigs.length - 1;

    return (
        <Breadcrumbs separator={separator}>
            <Menu width={200} shadow="md">
                <MenuTarget>
                    <Button variant="light" size="compact-sm">
                        ...
                    </Button>
                </MenuTarget>

                <MenuDropdown>
                    {configsAsMenu.map((config, index) => (
                        <MenuItem key={`menu-item-${index}`}>
                            <Group justify="center">
                                <Anchor component={Link} href={config.href}>
                                    {config.title}
                                </Anchor>
                            </Group>
                        </MenuItem>
                    ))}
                </MenuDropdown>
            </Menu>
            {fullDisplayConfigs.map((c, index) => {
                if (lastFullDisplayConfigItem === index)
                    return <Text c="dimmed"> {c.title}</Text>;

                return (
                    <Anchor key={index} href={c.href} component={Link}>
                        {c.title}
                    </Anchor>
                );
            })}
        </Breadcrumbs>
    );
};

const FullForm: FC<HierarchyProps> = ({
    hierarchyConfig,
    breadcrumbOpts,
    separator,
}) => {
    return (
        <Breadcrumbs separator={separator} {...breadcrumbOpts}>
            {hierarchyConfig.map((c, index, array) => {
                if (index === array.length - 1) {
                    return c.title;
                }

                return (
                    <Anchor key={index} href={c.href} component={Link}>
                        {c.title}
                    </Anchor>
                );
            })}
        </Breadcrumbs>
    );
};

export const Hierarchy: FC<HierarchyProps> = ({
    hierarchyConfig,
    separator = "/",
    breadcrumbOpts,
}) => {
    const theme = useMantineTheme();
    const { isSmallDevice } = useIsSmallDevice();

    const showShortForm = isSmallDevice && hierarchyConfig.length > 4;

    return (
        <Container
            bg="var(--mantine-color-body)"
            py="sm"
            px={0}
            w={"100%"}
            pos="sticky"
            top="calc(var(--app-shell-header-height) - 3px)"
            style={{ zIndex: theme.other.zIndexXS }}
        >
            {showShortForm ? (
                <ShortFormat
                    configs={hierarchyConfig}
                    separator={separator}
                    visibleQuantity={3}
                />
            ) : (
                <FullForm
                    hierarchyConfig={hierarchyConfig}
                    separator={separator}
                    breadcrumbOpts={breadcrumbOpts}
                />
            )}
        </Container>
    );
};
