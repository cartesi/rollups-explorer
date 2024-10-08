"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import { Alert, Card, Stack, Text, Textarea, Title } from "@mantine/core";
import { decodePayload } from "../decoder";
import { useSpecFormContext } from "../form/context";
import { buildSpecification, stringifyContent } from "../utils";

export const DecodingPreview = () => {
    const form = useSpecFormContext();
    const values = form.getTransformedValues();
    const { encodedData } = values;
    const tempSpec = buildSpecification(values);
    const envelope =
        tempSpec && encodedData ? decodePayload(tempSpec, encodedData) : null;
    const content = envelope?.result ? stringifyContent(envelope.result) : null;

    return (
        <Card shadow="sm" withBorder>
            <Title order={3}>Preview</Title>
            <Stack gap="lg">
                <Textarea
                    resize="vertical"
                    rows={5}
                    label="Data"
                    id="encoded-data-preview"
                    description="Encoded data to test against specification"
                    {...form.getInputProps("encodedData")}
                />

                {content && (
                    <CodeHighlight
                        data-testid="preview-decoded-data"
                        withCopyButton={false}
                        language="json"
                        code={content}
                    />
                )}

                {envelope?.error && (
                    <Alert
                        color="yellow"
                        title="Keep changing your specification"
                    >
                        <Text style={{ whiteSpace: "pre-line" }}>
                            {envelope.error.message}
                        </Text>
                    </Alert>
                )}
            </Stack>
        </Card>
    );
};
