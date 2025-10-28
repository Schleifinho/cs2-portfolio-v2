import {useMemo} from "react";

/**
 * Generic fuzzy token search with scoring.
 * @param items - list of items
 * @param search - search string
 * @param getText - function to extract searchable text from each item
 */
export function useTokenSearch<T>(
    items: T[],
    search: string,
    getText: (item: T) => string
): T[] {
    return useMemo(() => {
        const tokens = search
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (tokens.length === 0) return items;

        return items
            .map((item) => {
                const text = getText(item).toLowerCase();

                let score = 0;
                for (const token of tokens) {
                    const idx = text.indexOf(token);
                    if (idx !== -1) {
                        // Base points per match
                        let tokenScore = 10;

                        // Reward longer tokens
                        tokenScore += token.length * 2;

                        // Small bonus for early matches
                        tokenScore += Math.max(0, 5 - idx * 0.1);

                        score += tokenScore;
                    }
                }

                return {item, score};
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((x) => x.item);
    }, [items, search, getText]);
}
