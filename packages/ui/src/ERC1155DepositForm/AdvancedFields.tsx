import { Collapse, Textarea } from "@mantine/core";
import { FC } from "react";
import { useFormContext } from "./context";

interface Props {
    display: boolean;
}

const AdvancedFields: FC<Props> = ({ display }) => {
    const form = useFormContext();

    return (
        <Collapse in={display}>
            <Textarea
                label="Base layer data"
                description="Additional data to be interpreted by the base layer"
                {...form.getInputProps("baseLayerData")}
            />

            <Textarea
                label="Execution layer data"
                description="Additional data to be interpreted by the execution layer"
                {...form.getInputProps("execLayerData")}
            />
        </Collapse>
    );
};

export default AdvancedFields;
