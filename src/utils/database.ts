import { Quote } from "../models/quotes";

const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", `Basic ${import.meta.env.VITE_HARPERDB_TOKEN}`);

async function harperRequest(body: any): Promise<any> {
    const response = await fetch(import.meta.env.VITE_HARPERDB_HOST as string, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        redirect: "follow",
    });

    if (response.ok) {
        const json = response.json();
        console.debug(json);
        return json;
    } else {
        return Promise.reject(response);
    }
}

export function addQuote(quote: Quote): void {
    harperRequest({
        operation: "insert",
        schema: import.meta.env.VITE_HARPERDB_SCHEMA as string,
        table: import.meta.env.VITE_HARPERDB_TABLE as string,
        records: [quote],
    });
}

export async function getQuotes(): Promise<Quote[] | null> {
    try {
        const request = await harperRequest({
            operation: "sql",
            sql: `SELECT * FROM ${
                import.meta.env.VITE_HARPERDB_SCHEMA as string
            }.${import.meta.env.VITE_HARPERDB_TABLE as string}`,
        });

        return request.map((quote: HarperQuote): Quote => {
            delete quote["__createdtime__"];
            delete quote["__updatedtime__"];
            return quote as Quote;
        });
    } catch {
        return Promise.reject();
    }
}

export function switchInUseQuote(quoteId: number, inUseQuoteId?: number) {
    let records = [{ id: quoteId, used: true, inUse: true }];
    if (inUseQuoteId) {
        records.push({ id: inUseQuoteId, used: true, inUse: false });
    }

    harperRequest({
        operation: "update",
        schema: import.meta.env.VITE_HARPERDB_SCHEMA as string,
        table: import.meta.env.VITE_HARPERDB_TABLE as string,
        records,
    });
}

interface HarperQuote extends Quote {
    __createdtime__?: string;
    __updatedtime__?: string;
}
