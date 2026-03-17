"use client";
import { Card, Center, Group, Stack, Text, Title } from "@mantine/core";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { type FC } from "react";
import { useSpecification } from "../hooks/useSpecification";
import { EditSpecificationButton } from "./EditSpecificationButton";
import { NewSpecificationButton } from "./NewSpecificationButton";

export const EditSpecificationNotFound: FC<{ id: string }> = ({ id }) => {
    const { listSpecifications } = useSpecification();
    const specifications = listSpecifications() ?? [];
    const hasSpecs = isNotNilOrEmpty(specifications);

    return (
        <Stack>
            <Center>
                <Title order={3}>
                    We could not find the Specification id {id}
                </Title>
            </Center>
            {hasSpecs && (
                <Center>
                    <Stack>
                        <Title order={4}>
                            But you can edit one of the following
                        </Title>

                        {specifications.map((spec) => (
                            <Card key={spec.id}>
                                <Group justify="space-between">
                                    <Text>{spec.name}</Text>
                                    <EditSpecificationButton id={spec.id!} />
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                </Center>
            )}
            {!hasSpecs && (
                <Center>
                    <Group>
                        <Title order={4}> You have none created!</Title>
                        <NewSpecificationButton btnText="Create a new one!" />
                    </Group>
                </Center>
            )}
        </Stack>
    );
};
