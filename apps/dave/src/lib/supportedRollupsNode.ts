import {
    minVersion,
    outside,
    Range,
    satisfies,
    valid,
    validRange,
} from "semver";

/**
 * Use semantic versioning to declare supported versions.
 */
const supportedVersionRange = new Range("^2.0.0-alpha.9");
const fullSupportedRange = validRange(supportedVersionRange.raw)!;
const minimalVersion = minVersion(supportedVersionRange);

type CheckNodeVersionReturn =
    | {
          status: "not-valid-semantic-versioning";
          error: Error;
      }
    | {
          status: "not-supported-version";
          error: Error;
          extra: {
              supportedRange: string;
          };
      }
    | {
          status: "supported";
      };

export const checkNodeVersion = (
    nodeVersion: string,
): CheckNodeVersionReturn => {
    const isValidVersion = valid(nodeVersion);

    if (!isValidVersion) {
        return {
            status: "not-valid-semantic-versioning",
            error: new Error(` ${nodeVersion} is not a valid semantic version`),
        };
    }

    const isSupportedVersion = satisfies(nodeVersion, supportedVersionRange);

    if (!isSupportedVersion) {
        const complement = outside(nodeVersion, supportedVersionRange, ">")
            ? "is not supported yet"
            : outside(nodeVersion, supportedVersionRange, "<")
              ? `is older than minimal version (${minimalVersion?.toString()})`
              : "";

        return {
            status: "not-supported-version",
            error: new Error(`The version ${nodeVersion} ${complement}`),
            extra: {
                supportedRange: fullSupportedRange,
            },
        };
    }

    return { status: "supported" };
};
