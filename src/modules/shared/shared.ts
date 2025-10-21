import { User } from "../users/users.model"
import { PaginatedResult } from "./types"

export function exportRecord<T extends Record<string, any>>(record: T) {
    return Object.entries(record).reduce((pv, [k, v], index) => {
        if (k in ['password'])
            return pv
        return { ...pv, [k]: v }
    })
}

export function exportRecords<T extends Record<string, any>>(records: T[]) {
    return records.map((v) => exportRecord(v))
}

export function paginateResult<T extends Record<string, any>>(
    items: T[], 
    perPage: number, 
    docCount: number, 
    page: number
): PaginatedResult<T> {
    return {
        page,
        perPage,
        totalPages: Math.ceil(docCount/perPage),
        itemCount: items.length,
        items,
    }
}