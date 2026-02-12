"use client";
import {
    Modal,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import { isNotNil } from "ramda";
import { Activity, useState, type FC } from "react";
import ConnectionForm from "./ConnectionForm";
import ConnectionView from "./ConnectionView";
import {
    useNodeConnection,
    useShowConnectionModal,
    useSystemConnection,
} from "./hooks";

type ViewControl = "manage" | "create";

const connectionListMaxHeight = 380;

const ConnectionModal: FC = () => {
    const showModal = useShowConnectionModal();
    const systemConnection = useSystemConnection();
    const { closeConnectionModal, listConnections, getSelectedConnection } =
        useNodeConnection();
    const [viewControl, setViewControl] = useState<ViewControl>("manage");

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

            <Stack mt="lg" mah={connectionListMaxHeight} gap={"lg"}>
                <ScrollArea.Autosize
                    mah={connectionListMaxHeight}
                    type="scroll"
                    scrollbars="y"
                    offsetScrollbars
                >
                    <Stack gap="sm" py="xs">
                        <Activity
                            mode={
                                viewControl === "manage" ? "visible" : "hidden"
                            }
                        >
                            {isNotNil(systemConnection) && (
                                <ConnectionView connection={systemConnection} />
                            )}

                            {listConnections().map((connection) => (
                                <ConnectionView
                                    key={connection.id}
                                    connection={connection}
                                />
                            ))}
                        </Activity>

                        <Activity
                            mode={
                                viewControl === "create" ? "visible" : "hidden"
                            }
                        >
                            <ConnectionForm />
                        </Activity>
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Modal>
    );
};

export default ConnectionModal;
