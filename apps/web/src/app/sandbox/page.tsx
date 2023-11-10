"use client";

import {
    Accordion,
    Button,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { toPairs, type } from "ramda";
import React, { FC, useEffect, useState } from "react";
import { TbCode } from "react-icons/tb";

type PluginLoaderProps = { libName: string };

const generateEventName = (lib: string) => `cartesiscan:plugin:${lib}:loaded`;

interface PluginDetail {
    name: string;
    // at this point anything
    module: any;
}

interface PluginState {
    state: "NOT_INITIATED" | "LOADING" | "FINISHED";
    detail?: PluginDetail;
}

const useLoadPlugin = (libName: string): PluginState => {
    const [pluginDetail, setPluginDetails] = useState<PluginState>({
        state: "NOT_INITIATED",
    });

    const eventHandler = React.useCallback(
        (evt: Event) => {
            const pluginDetail = (evt as CustomEvent).detail;
            setPluginDetails({ state: "FINISHED", detail: pluginDetail });
        },
        [setPluginDetails],
    );

    useEffect(() => {
        window.addEventListener(generateEventName(libName), eventHandler);
        // cleanup
        return () =>
            window.removeEventListener(
                generateEventName(libName),
                eventHandler,
            );
    }, [eventHandler, libName]);

    useEffect(() => {
        if (libName) {
            setPluginDetails({ state: "LOADING" });
            const script = document.createElement("script");
            const url = `https://cdn.skypack.dev/${libName}`;
            script.type = "module";
            const template = `
                import * as module from "${url}";
                
                window.dispatchEvent(new CustomEvent("${generateEventName(
                    libName,
                )}", {
                    detail: {name: '${libName}', module: module}
                }))
            `;

            script.appendChild(document.createTextNode(template));
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [libName]);

    return pluginDetail;
};

const PluginLoader: FC<PluginLoaderProps> = ({ libName }) => {
    const loadPlugin = useLoadPlugin(libName);
    console.log(loadPlugin.detail?.module);

    if (loadPlugin.detail?.module) {
        const [key, val] = toPairs(loadPlugin.detail?.module)[4];
        console.log(key, val.toString());
    }

    return (
        <>
            {loadPlugin.state === "LOADING" ? (
                <Loader />
            ) : loadPlugin.state === "FINISHED" ? (
                <Accordion.Item key={libName} value={libName}>
                    <Accordion.Control icon={<TbCode />}>
                        {libName}
                    </Accordion.Control>
                    <Accordion.Panel>
                        {toPairs(loadPlugin.detail?.module).map(
                            ([name, value], index) => {
                                return (
                                    <Paper
                                        key={index}
                                        shadow="sm"
                                        radius="md"
                                        m="md"
                                        p="md"
                                    >
                                        <Stack>
                                            <Title order={3}>
                                                {name}:{" "}
                                                <Text
                                                    variant="gradient"
                                                    span
                                                    inherit
                                                >
                                                    {type(value)}
                                                </Text>
                                            </Title>
                                            <Text lineClamp={3}>
                                                {value?.toString() ??
                                                    "No value defined"}
                                            </Text>
                                        </Stack>
                                    </Paper>
                                );
                            },
                        )}
                    </Accordion.Panel>
                </Accordion.Item>
            ) : (
                <Title>Starting...</Title>
            )}
        </>
    );
};

const Page = () => {
    const [entry, setEntry] = useState<string>("");
    const [entries, setEntries] = useState<string[]>([]);

    return (
        <Stack px="lg">
            <Group justify="center">
                <Title>Loading Libraries</Title>
                <TextInput
                    placeholder="e.g. lodash"
                    onChange={(ev) => setEntry(ev.target.value)}
                    value={entry}
                />
                <Button
                    onClick={() => {
                        setEntries((c) => [entry, ...c]);
                        setEntry("");
                    }}
                >
                    Add
                </Button>
            </Group>

            <Accordion>
                {entries.map((name) => (
                    <PluginLoader key={name} libName={name} />
                ))}
            </Accordion>
        </Stack>
    );
};

export default Page;
