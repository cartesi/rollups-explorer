/**
 * @description Checks if two values are equal by using JSON.stringify comparison
 * @param valueA
 * @param valueB
 * @return boolean
 */
export const isEqual = <T>(valueA: T, valueB: T) => {
    return JSON.stringify(valueA) === JSON.stringify(valueB);
};
