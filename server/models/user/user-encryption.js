import { randomBytes } from 'crypto';
import { genSalt, hash, compare } from 'bcrypt';

export default class UserEncryption {
    constructor() { }

    static generateId(length) {
        try {
            const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const BYTES = randomBytes(length);
            let id = '';

            for (let i = 0; i < length; i++) {
                id += CHARSET[BYTES[i] % CHARSET.length];
            }
            return id;
        } catch (error) {
            console.error('Error generating ID:', error);
            return null;
        }
    }

    static async encryptPassword(password) {
        const SALT_ROUNDS = 15;

        try {
            const SALT = await genSalt(SALT_ROUNDS);
            const ENCRYPTED = await hash(password, SALT);
            return ENCRYPTED;
        } catch (err) {
            console.error('Error encrypting password:', err);
            return null;
        }
    }

    static async comparePassword(password, hashedPassword) {
        try {
            const IS_MATCH = await compare(password, hashedPassword);
            return IS_MATCH;
        } catch (err) {
            console.error('Error comparing password:', err);
            return false;
        }
    }
}

