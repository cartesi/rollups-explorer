"use client";
import {
    Modal,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import { isEmpty, isNotNil } from "ramda";
import { Activity, useEffect, useRef, type FC } from "react";
import CenteredText from "../CenteredText";
import ConnectionForm from "./ConnectionForm";
import ConnectionView from "./ConnectionView";
import {
    useConnectionModalMode,
    useNodeConnection,
    useShowConnectionModal,
} from "./hooks";

export type ViewControl = "manage" | "create";

const connectionListMaxHeight = 380;

const ConnectionModal: FC = () => {
    const showModal = useShowConnectionModal();
    const viewMode = useConnectionModalMode();
    const {
        closeConnectionModal,
        listConnections,
        getSelectedConnection,
        changeViewMode,
    } = useNodeConnection();
    const selectedConnection = getSelectedConnection();
    const viewport = useRef<HTMLDivElement>(null);
    const connections = listConnections();
    const hasConnections = !isEmpty(connections);

    useEffect(() => {
        viewport.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [selectedConnection?.timestamp]);

    return (
        <Modal
            size="xl"
            opened={showModal}
            withCloseButton={isNotNil(selectedConnection)}
            onClose={closeConnectionModal}
            closeOnClickOutside={false}
            closeOnEscape={false}
            title={
                <Text tt="uppercase" fw="bold" size="lg">
                    node connections
                </Text>
            }
        >
            <SegmentedControl
                value={viewMode}
                onChange={(value) => changeViewMode(value as ViewControl)}
                data={[
                    { value: "manage", label: "Manage" },
                    { value: "create", label: "Create" },
                ]}
            />

            <Activity mode={viewMode === "manage" ? "visible" : "hidden"}>
                <Stack py="lg" mah={connectionListMaxHeight}>
                    <ScrollArea.Autosize
                        viewportRef={viewport}
                        mah={connectionListMaxHeight}
                        type="scroll"
                        scrollbars="y"
                        offsetScrollbars
                    >
                        <Stack gap="sm" py="xs">
                            {isNotNil(selectedConnection) && (
                                <ConnectionView
                                    connection={selectedConnection}
                                    key={selectedConnection.id}
                                />
                            )}
                            {connections.map((connection) => (
                                <ConnectionView
                                    key={connection.id}
                                    connection={connection}
                                    hideIfSelected
                                />
                            ))}
                            {!hasConnections && (
                                <CenteredText
                                    key={"no-connections-manage-view"}
                                    text="No connections"
                                    cardProps={{
                                        shadow: "sm",
                                    }}
                                />
                            )}
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </Activity>

            <Stack py="lg">
                {viewMode === "create" && (
                    <ConnectionForm
                        onConnectionSaved={() => changeViewMode("manage")}
                    />
                )}
            </Stack>
        </Modal>
    );
};

export default ConnectionModal;
