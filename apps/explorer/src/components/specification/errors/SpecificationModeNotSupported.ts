import { type Specification, specModes } from "../types";

export default class SpecificationModeNotSupportedError extends Error {
    constructor(specification: Specification) {
        const supported = specModes.join(", ");
        const message = `Supported Specification modes: [${supported}] - but found ${specification.mode}`;
        super(message);
    }
}
