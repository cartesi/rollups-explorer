"use client";
import {
    ActionIcon,
    Box,
    Collapse,
    Grid,
    useMantineTheme,
    useMatches,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { FC } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { content } from "../../content";
import { SummaryCard, type SummaryCardProps } from "../SummaryCard";
import classes from "./SummaryCards.module.css";

const text = content.global.summary;

export type CardsPerRow = { base: number; xs: number; sm: number };

const visibleOnPhone = 2;

interface CardsGridProps {
    cards: SummaryCardProps[];
    perRow: CardsPerRow;
}

const CardsGrid: FC<CardsGridProps> = ({ cards, perRow }) => (
    <Grid gutter="sm">
        {cards.map((card) => (
            <Grid.Col
                key={card.title}
                span={{
                    base: 12 / perRow.base,
                    xs: 12 / perRow.xs,
                    sm: 12 / perRow.sm,
                }}
                mb="sm"
            >
                <SummaryCard {...card} />
            </Grid.Col>
        ))}
    </Grid>
);

export interface SummaryCardsProps {
    cards: SummaryCardProps[];

    perRow: CardsPerRow;

    defaultOpened?: boolean;
}

/** Summary counters: the first row stays visible, the rest sits behind a caret edge. On phones the top two stay visible. */
export const SummaryCards: FC<SummaryCardsProps> = ({
    cards,
    perRow,
    defaultOpened = false,
}) => {
    const visibleCount = useMatches({ ...perRow, base: visibleOnPhone });
    const [opened, { toggle }] = useDisclosure(defaultOpened);
    const caretSize = useMantineTheme().other.xsIconSize;
    const firstRow = cards.slice(0, visibleCount);
    const rest = cards.slice(visibleCount);

    return (
        <Box>
            <Box className={classes.visible}>
                <CardsGrid cards={firstRow} perRow={perRow} />
                {rest.length > 0 && !opened && <Box className={classes.fade} />}
            </Box>
            {rest.length > 0 && (
                <>
                    <Collapse in={opened}>
                        <CardsGrid cards={rest} perRow={perRow} />
                    </Collapse>
                    <Box className={classes.edge}>
                        <Box className={classes.caret}>
                            <ActionIcon
                                className={classes.caretButton}
                                variant="default"
                                radius="xl"
                                size="sm"
                                onClick={toggle}
                                aria-expanded={opened}
                                aria-label={
                                    opened
                                        ? text.hideTxt
                                        : text.showMoreTxt(rest.length)
                                }
                            >
                                {opened ? (
                                    <TbChevronUp size={caretSize} />
                                ) : (
                                    <TbChevronDown size={caretSize} />
                                )}
                            </ActionIcon>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};
