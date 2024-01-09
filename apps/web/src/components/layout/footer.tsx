import type { FC, ReactNode } from "react";
import {
    Anchor,
    Box,
    Flex,
    List,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import {
    TbBrandDiscord,
    TbBrandGithub,
    TbBug,
    TbMessage2Code,
} from "react-icons/tb";
import CartesiLogo from "../cartesiLogo";

interface FooterLinkProps {
    children: ReactNode;
    href: string;
    color?: string;
}

const FooterLink: FC<FooterLinkProps> = ({ children, href, color }) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    return (
        <Anchor
            href={href}
            target="_blank"
            component={Link}
            c={color ?? theme.colors.gray[colorScheme === "light" ? 7 : 6]}
        >
            {children}
        </Anchor>
    );
};

const Footer: FC = () => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);

    return (
        <footer
            style={{
                position: "relative",
                zIndex: 102,
                backgroundColor: "var(--mantine-color-body)",
                padding: isSmallDevice ? "2rem" : "3rem 4rem",
                borderTop: `calc(0.0625rem * var(--mantine-scale)) solid ${
                    colorScheme === "light"
                        ? "var(--mantine-color-gray-3)"
                        : "var(--mantine-color-dark-4)"
                }`,
            }}
        >
            <Flex
                justify="space-between"
                direction={isSmallDevice ? "column" : "row"}
            >
                <Box
                    mr={isSmallDevice ? 0 : "2rem"}
                    style={{ order: isSmallDevice ? 2 : 1 }}
                >
                    <CartesiLogo height={40} />
                    <Text mt={12}>
                        CartesiScan is a tool for inspecting and analyzing
                        Cartesi rollups applications.
                        <br />
                        Blockchain explorer for Ethereum Networks.
                    </Text>

                    <Text mt={20} data-testid="app-copyright">
                        (c) Cartesi and individual authors (see{" "}
                        <FooterLink
                            href="https://github.com/cartesi/rollups-explorer/blob/main/AUTHORS"
                            color="var(--text-color)"
                        >
                            AUTHORS
                        </FooterLink>
                        )
                        <br />
                        SPDX-License-Identifier: Apache-2.0 (see{" "}
                        <FooterLink
                            href="https://github.com/cartesi/rollups-explorer/blob/main/LICENSE"
                            color="var(--text-color)"
                        >
                            LICENSE
                        </FooterLink>
                        )
                    </Text>
                </Box>

                <Flex
                    justify="space-between"
                    direction={isSmallDevice ? "column" : "row"}
                    mr={isSmallDevice ? 0 : "4rem"}
                    style={{ order: isSmallDevice ? 1 : 2 }}
                >
                    <Box w="14rem">
                        <Text size="lg" mb="1rem">
                            CartesiScan
                        </Text>
                        <List>
                            <List.Item
                                icon={
                                    <Flex>
                                        <TbBug size={20} />
                                    </Flex>
                                }
                            >
                                <FooterLink href="https://github.com/cartesi/rollups-explorer/issues/new?assignees=&labels=Type%3A+Bug%2CStatus%3A+Needs+triage&projects=&template=2-bug.md&title=">
                                    Report a bug
                                </FooterLink>
                            </List.Item>
                            <List.Item
                                icon={
                                    <Flex>
                                        <TbMessage2Code
                                            size={20}
                                            style={{ display: "flex" }}
                                        />
                                    </Flex>
                                }
                            >
                                <FooterLink href="https://github.com/cartesi/rollups-explorer/issues/new?assignees=&labels=Type%3A+Feature%2CStatus%3A+Needs+triage&projects=&template=1-feature.md&title=">
                                    Feature request
                                </FooterLink>
                            </List.Item>
                            <List.Item
                                icon={
                                    <Flex>
                                        <TbBrandGithub
                                            size={20}
                                            style={{ display: "flex" }}
                                        />
                                    </Flex>
                                }
                            >
                                <FooterLink href="https://github.com/cartesi/rollups-explorer/blob/main/CONTRIBUTING.md">
                                    Contribute
                                </FooterLink>
                            </List.Item>
                            <List.Item
                                icon={
                                    <Flex>
                                        <TbBrandDiscord
                                            size={20}
                                            style={{ display: "flex" }}
                                        />
                                    </Flex>
                                }
                            >
                                <FooterLink href="https://discord.com/invite/pfXMwXDDfW">
                                    Discord
                                </FooterLink>
                            </List.Item>
                        </List>
                    </Box>

                    <Box my={isSmallDevice ? "2rem" : 0}>
                        <Text size="lg" mb="1rem">
                            General
                        </Text>
                        <FooterLink href="https://docs.cartesi.io/">
                            Docs
                        </FooterLink>
                    </Box>
                </Flex>
            </Flex>
        </footer>
    );
};

export default Footer;
