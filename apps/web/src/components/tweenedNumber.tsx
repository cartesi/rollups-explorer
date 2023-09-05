"use client";
import { animated, useSpring } from "@react-spring/web";

interface NumberProps {
    value: number;
}

const TweenedNumber = ({ value }: NumberProps) => {
    const { number } = useSpring({
        from: { number: 0 },
        number: value,
        delay: 200,
        config: { mass: 1, tension: 20, friction: 10 },
    });

    return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
};

export default TweenedNumber;
