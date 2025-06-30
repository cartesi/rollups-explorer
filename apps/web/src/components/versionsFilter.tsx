import React, {
    ChangeEvent,
    FC,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { ActionIcon, Button, Checkbox, Flex, Menu } from "@mantine/core";
import { TbFilter, TbFilterFilled } from "react-icons/tb";
import { useUrlSearchParams } from "../hooks/useUrlSearchParams";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import { isNilOrEmpty } from "ramda-adjunct";

export type FilterVersion = `${RollupVersion}`;

interface VersionFilterProps {
    onChange: (versions: string[]) => void;
}

export const VersionsFilter: FC<VersionFilterProps> = (props) => {
    const { onChange } = props;
    const [opened, setOpened] = useState(false);
    const [{ limit, page, query, version }, updateParams] =
        useUrlSearchParams();
    const [activeVersions, setActiveVersions] = useState<FilterVersion[]>([]);
    const lastActiveVersions = useRef(activeVersions);
    const FilterIcon = activeVersions.length > 0 ? TbFilterFilled : TbFilter;
    const isFilterSyncedWithQuery = useRef(false);
    const isApplied = useRef(false);

    const onChangeFilters = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const name = event.currentTarget.name as FilterVersion;
            const nextActiveVersions: FilterVersion[] = event.currentTarget
                .checked
                ? [...activeVersions, name]
                : activeVersions.filter((version) => version !== name);
            setActiveVersions(nextActiveVersions);
        },
        [activeVersions],
    );

    const onApply = useCallback(() => {
        onChange(activeVersions);
        updateParams(page, limit, query, activeVersions.join());
        setOpened(false);
        isApplied.current = true;
    }, [activeVersions, limit, onChange, page, query, updateParams]);

    const onClear = useCallback(() => {
        setActiveVersions([]);
        onChange([]);
        updateParams(page, limit, query, "");
        setOpened(false);
    }, [limit, onChange, page, query, updateParams]);

    const onChangeOpened = useCallback(
        (opened: boolean) => {
            setOpened(opened);

            if (opened) {
                isApplied.current = false;
            }

            if (!opened && !isApplied.current) {
                const versions = isNilOrEmpty(version)
                    ? []
                    : (version.split(",") as FilterVersion[]);
                setActiveVersions(versions);
            }
        },
        [version],
    );

    /**
     * @description Synchronize the filters value with the url value once, on page load
     */
    const syncFiltersWithQuery = useCallback(() => {
        if (
            !isFilterSyncedWithQuery.current &&
            lastActiveVersions.current.join() !== version
        ) {
            const versions = isNilOrEmpty(version)
                ? []
                : (version.split(",") as FilterVersion[]);
            setActiveVersions(versions);
            onChange(versions);
            lastActiveVersions.current = versions;
            isFilterSyncedWithQuery.current = true;
        }
    }, [onChange, version]);

    useEffect(() => syncFiltersWithQuery(), [syncFiltersWithQuery]);

    return (
        <Menu
            shadow="md"
            width={180}
            closeOnItemClick={false}
            opened={opened}
            onChange={onChangeOpened}
        >
            <Menu.Target>
                <ActionIcon size="xl">
                    <FilterIcon style={{ width: "60%", height: "60%" }} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Application Version</Menu.Label>
                <Menu.Item>
                    <Checkbox
                        checked={activeVersions.includes("v1")}
                        label="Rollups v1"
                        name="v1"
                        onChange={onChangeFilters}
                    />
                </Menu.Item>
                <Menu.Item mb={12}>
                    <Checkbox
                        checked={activeVersions.includes("v2")}
                        label="Rollups v2"
                        name="v2"
                        onChange={onChangeFilters}
                    />
                </Menu.Item>

                <Menu.Divider />

                <Flex justify="space-between">
                    <Button variant="subtle" onClick={onClear}>
                        Clear
                    </Button>
                    <Button variant="subtle" onClick={onApply}>
                        Apply
                    </Button>
                </Flex>
            </Menu.Dropdown>
        </Menu>
    );
};
