import argon2, { argon2id } from "argon2";

export async function hashPassword(password: string) {
    return await argon2.hash(password, { version: argon2id, hashLength: 40  })
}

export async function verifyPassword(password: string, hash: string) {
    return await argon2.verify(hash, password)
}

