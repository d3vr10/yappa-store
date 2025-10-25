import z from "zod";

function convertBooleanStringToBoolean(value: string): boolean | string {
    switch (value.toLowerCase()) {
        case 'true':
        case 'yes':
        case 'y':
            return true
        case 'false':
        case 'no':
        case 'n':
            return false
    }
    return value
}

export const deleteObjectQueryInput = z.object({
    permanently: z.union([
        z.string()
        .transform(convertBooleanStringToBoolean)
        .refine((value) =>
            typeof value === 'boolean',

            `string must be one of these values:\nfalse, no, n, true, yes or y. Not ""`
        ),
        z.boolean(),
    ]).default(false),
}).partial()