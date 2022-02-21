import type { Quote } from "./quotes";

export type HarperQuote = Quote & {
    __createdtime__?: string;
    __updatedtime__?: string;
};

export type HarperRecord = {
    id: number;
    quote?: string;
    quotee?: string;
    media?: string;
    used: boolean;
    inUse: boolean;
};
export type HarperRequest = {
    operation: "insert" | "update" | "sql";
    sql?: string;
    schema?: string;
    table?: string;
    records?: HarperRecord[];
};
