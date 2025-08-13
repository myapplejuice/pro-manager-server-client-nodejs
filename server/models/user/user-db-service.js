import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "./user-encryption.js";
import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION_STRING = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true,
        trustedConnection: true
    }
};

let tablesReady = false;

export default class UserDBService {
    static pool;

    static async init() {
        if (!UserDBService.pool) {
            try {
                console.log(DB_CONNECTION_STRING);
                UserDBService.pool = await sql.connect(DB_CONNECTION_STRING);
                await UserDBService.validateTablesExistence();
                tablesReady = true;
                console.log("DB connected and table checked/created");
            } catch (err) {
                console.error("DB Connection/init error:", err);
                tablesReady = false;
            }
        }
    }

    static async validateTablesExistence() {
        const tableCheckQuery = `
           IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
           BEGIN
             CREATE TABLE dbo.Users (
               Id VARCHAR(50) NOT NULL PRIMARY KEY,
               Username VARCHAR(50) NOT NULL,
               Firstname VARCHAR(50) NOT NULL,
               Lastname VARCHAR(50) NOT NULL,
               Age INT NOT NULL,
               Gender VARCHAR(20) NOT NULL,
               Email VARCHAR(50) NOT NULL,
               Phone VARCHAR(50) NOT NULL,
               Password VARCHAR(256) NOT NULL,
               IsCoach BIT NOT NULL,
               ImageBase64 VARCHAR(MAX) NOT NULL
             )
           END
           `;
        await UserDBService.pool.request().query(tableCheckQuery);
    }

    static mapUser(record) {
        return {
            id: record.Id,
            username: record.Username,
            firstname: record.Firstname,
            lastname: record.Lastname,
            age: record.Age,
            gender: record.Gender,
            email: record.Email,
            phone: record.Phone,
            isCoach: !!record.IsCoach,
            imageBase64: record.ImageBase64
        };
    }

    static async generateUniqueId() {
        await UserDBService.init();
        let newId;
        let isUnique = false;

        while (!isUnique) {
            newId = UserEncryption.generateId(15);
            const existingUser = await UserDBService.fetchUserById(newId);
            if (!existingUser) isUnique = true;
        }

        return newId;
    }

    static async insertUser(newUser) {
        await UserDBService.init();
        if (!tablesReady) return { success: false, message: "DB not ready" };

        const query = `
      INSERT INTO Users
      (Id, Username, Firstname, Lastname, Age, Gender, Email, Phone, Password, IsCoach, ImageBase64)
      VALUES
      (@Id, @Username, @Firstname, @Lastname, @Age, @Gender, @Email, @Phone, @Password, @IsCoach, @ImageBase64)
    `;

        try {
            const request = UserDBService.pool.request();
            const newId = await UserDBService.generateUniqueId();

            request.input("Id", sql.VarChar(50), newId);
            request.input("Username", sql.VarChar(50), newUser.username);
            request.input("Firstname", sql.VarChar(50), newUser.firstname);
            request.input("Lastname", sql.VarChar(50), newUser.lastname);
            request.input("Age", sql.Int, newUser.age);
            request.input("Gender", sql.VarChar(20), newUser.gender);
            request.input("Email", sql.VarChar(50), newUser.email);
            request.input("Phone", sql.VarChar(50), newUser.phone);
            const hashedPassword = await UserEncryption.encryptPassword(newUser.password);
            request.input("Password", sql.VarChar(256), hashedPassword);
            request.input("IsCoach", sql.Bit, newUser.isCoach ? 1 : 0);
            request.input("ImageBase64", sql.VarChar(sql.MAX), newUser.imageBase64);

            await request.query(query);

            const insertedUser = await UserDBService.fetchUser(newUser.email);
            if (!insertedUser) return { success: false, message: "Failed to fetch inserted user" };

            return { success: true, user: insertedUser };
        } catch (err) {
            console.error("InsertUser error:", err);
            return { success: false, message: "Database error during insert" };
        }
    }

    static async loginUser({ authentication, password }) {
        await UserDBService.init();
        if (!tablesReady) return { success: false, message: 'DB not ready' };

        try {
            const query = `
                SELECT * FROM Users WHERE Email COLLATE Latin1_General_CS_AS = @Auth OR Username COLLATE Latin1_General_CS_AS = @Auth
            `;

            const result = await UserDBService.pool
                .request()
                .input('Auth', sql.VarChar(50), authentication)
                .query(query);

            if (result.recordset.length === 0) {
                return { success: false, message: 'User not found' };
            }

            const user = UserDBService.mapUser(result.recordset[0]);
            const hashedPassword = result.recordset[0].Password

            const passwordMatches = await UserEncryption.comparePassword(password, hashedPassword);
            if (!passwordMatches) {
                return { success: false, message: 'Invalid password!' };
            }

            return { success: true, user };
        } catch (err) {
            console.error('LoginUser error:', err);
            return { success: false, message: 'Database error during login' };
        }
    }

    static async fetchUserById(id) {
        await UserDBService.init();
        if (!tablesReady) return null;

        const query = `SELECT * FROM Users WHERE Id = @Id`;

        try {
            const result = await UserDBService.pool
                .request()
                .input('Id', sql.VarChar(50), id)
                .query(query);

            if (result.recordset.length === 0) return null;

            return UserDBService.mapUser(result.recordset[0]);
        } catch (err) {
            console.error('FetchUserById error:', err);
            return null;
        }
    }

    static async fetchUser(email) {
        await UserDBService.init();
        if (!tablesReady) return null;

        const query = `
      SELECT * FROM Users
      WHERE Email COLLATE Latin1_General_CS_AS = @Email
    `;

        try {
            const result = await UserDBService.pool
                .request()
                .input('Email', sql.VarChar(50), email)
                .query(query);

            if (result.recordset.length === 0) return null;

            return UserDBService.mapUser(result.recordset[0]);
        } catch (err) {
            console.error('FetchUser error:', err);
            return null;
        }
    }

    static async fetchAllUsers() {
        await UserDBService.init();
        if (!tablesReady) return null;

        const query = `SELECT * FROM Users`;

        try {
            const result = await UserDBService.pool.request().query(query);
            return result.recordset.map(UserDBService.mapUser);
        } catch (err) {
            console.error('FetchAllUsers error:', err);
            return null;
        }
    }

    static async updateUser(id, details) {
        await UserDBService.init();
        if (!tablesReady) return null;

        const existingUser = await UserDBService.fetchUserById(id);
        if (!existingUser) return null;

        const updates = [];
        const request = UserDBService.pool.request();

        if (details.username) {
            updates.push('Username = @Username');
            request.input('Username', sql.VarChar(50), details.username);
        }
        if (details.firstname) {
            updates.push('Firstname = @Firstname');
            request.input('Firstname', sql.VarChar(50), details.firstname);
        }
        if (details.lastname) {
            updates.push('Lastname = @Lastname');
            request.input('Lastname', sql.VarChar(50), details.lastname);
        }
        if (details.age && details.age > 0) {
            updates.push('Age = @Age');
            request.input('Age', sql.Int, details.age);
        }
        if (details.gender) {
            updates.push('Gender = @Gender');
            request.input('Gender', sql.VarChar(20), details.gender);
        }
        if (details.email) {
            updates.push('Email = @Email');
            request.input('Email', sql.VarChar(50), details.email);
        }
        if (details.phone) {
            updates.push('Phone = @Phone');
            request.input('Phone', sql.VarChar(50), details.phone);
        }
        if (details.password) {
            updates.push('Password = @Password');
            const hashedPassword = await UserEncryption.encryptPassword(details.password);
            request.input('Password', sql.VarChar(256), hashedPassword);
        }
        if (details.imageBase64) {
            updates.push('ImageBase64 = @ImageBase64');
            request.input('ImageBase64', sql.VarChar(sql.MAX), details.imageBase64);
        }

        if (updates.length === 0) return null;

        const query = `
      UPDATE Users SET ${updates.join(', ')} WHERE Id = @Id
    `;

        request.input('Id', sql.VarChar(50), id);

        try {
            await request.query(query);
            return await UserDBService.fetchUserById(id);
        } catch (err) {
            console.error('UpdateUser error:', err);
            return null;
        }
    }

    static async updatePasswordByEmail(details) {
        await UserDBService.init();
        if (!tablesReady) return null;

        const { email, password } = details;

        if (!email || !password) {
            console.error('Email and password must be provided');
            return null;
        }

        const emailExists = await UserDBService.checkEmail(email);
        if (!emailExists) return null;

        const query = `
      UPDATE Users SET Password = @Password
      WHERE Email COLLATE Latin1_General_CS_AS = @Email
    `;

        try {
            const request = UserDBService.pool.request();
            const hashedPassword = await UserEncryption.encryptPassword(password);
            request.input('Password', sql.VarChar(256), hashedPassword);
            request.input('Email', sql.VarChar(50), email);

            await request.query(query);
            return true;
        } catch (err) {
            console.error('UpdatePasswordByEmail error:', err);
            return null;
        }
    }


    static async destroyUser(id) {
        await UserDBService.init();
        if (!tablesReady) return false;

        const query = `DELETE FROM Users WHERE Id = @Id`;

        try {
            const result = await UserDBService.pool
                .request()
                .input('Id', sql.VarChar(50), id)
                .query(query);

            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('DestroyUser error:', err);
            return false;
        }
    }

    static async checkEmail(email) {
        await UserDBService.init();
        if (!tablesReady) return false;

        const query = `
      SELECT COUNT(1) AS Count FROM Users
      WHERE Email COLLATE Latin1_General_CS_AS = @Email
    `;

        try {
            const result = await UserDBService.pool
                .request()
                .input('Email', sql.VarChar(50), email)
                .query(query);

            return result.recordset[0].Count > 0;
        } catch (err) {
            console.error('CheckEmail error:', err);
            return false;
        }
    }
}