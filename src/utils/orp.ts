export const calculateORP = (word: string): number => {
    const length = word.length;
    if (length <= 1) return 0;
    if (length <= 4) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
};

export const getORPChar = (word: string): string => {
    return word[calculateORP(word)] || "";
};
