"use client";
import {
    Modal,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import { isNotNil } from "ramda";
import { Activity, useEffect, useRef, useState, type FC } from "react";
import ConnectionForm from "./ConnectionForm";
import ConnectionView from "./ConnectionView";
import { useNodeConnection, useShowConnectionModal } from "./hooks";

type ViewControl = "manage" | "create";

const connectionListMaxHeight = 380;

const ConnectionModal: FC = () => {
    const showModal = useShowConnectionModal();
    const { closeConnectionModal, listConnections, getSelectedConnection } =
        useNodeConnection();
    const selectedConnection = getSelectedConnection();
    const [viewControl, setViewControl] = useState<ViewControl>("manage");
    const viewport = useRef<HTMLDivElement>(null);

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
                value={viewControl}
                onChange={(value) => setViewControl(value as ViewControl)}
                data={[
                    { value: "manage", label: "Manage" },
                    { value: "create", label: "Create" },
                ]}
            />

            <Activity mode={viewControl === "manage" ? "visible" : "hidden"}>
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
                            {listConnections().map((connection) => (
                                <ConnectionView
                                    key={connection.id}
                                    connection={connection}
                                    hideIfSelected
                                />
                            ))}
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </Activity>

            <Stack py="lg">
                {viewControl === "create" && (
                    <ConnectionForm
                        onConnectionSaved={() => setViewControl("manage")}
                    />
                )}
            </Stack>
        </Modal>
    );
};

export default ConnectionModal;
