import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";
dotenv.config();

const DB_CONNECTION_STRING = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true,
        trustedConnection: true,
    },
};

let tablesReady = false;

export default class PreferencesDBService {
    static pool;

    static async init() {
        if (!PreferencesDBService.pool) {
            try {
                PreferencesDBService.pool = await sql.connect(DB_CONNECTION_STRING);
                await PreferencesDBService.validateTablesExistence();
                tablesReady = true;
                console.log("DB connected and tables checked/created");
            } catch (err) {
                console.error("DB Connection/init error:", err);
                tablesReady = false;
            }
        }
    }

    static async validateTablesExistence() {
        const tableCheckQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Preferences' AND xtype='U')
      BEGIN
        CREATE TABLE dbo.Preferences (
          User_Id VARCHAR(50) NOT NULL PRIMARY KEY,
          Theme VARCHAR(50) NOT NULL,
          Language VARCHAR(50) NOT NULL
        )
      END
    `;
        await PreferencesDBService.pool.request().query(tableCheckQuery);
    }

    static mapRow(row) {
        return {
            userId: row.User_Id,
            theme: row.Theme,
            language: row.Language
        };
    }

    static async insertPreferences(id, preferences) {
        await PreferencesDBService.init();
        if (!tablesReady) return false;

        const query = `
        INSERT INTO Preferences (User_Id, Theme, Language)
        VALUES (@UserId, @Theme, @Language)
    `;

        try {
            const req = PreferencesDBService.pool.request();
            req.input("UserId", sql.VarChar(50), id);
            req.input("Theme", sql.VarChar(50), preferences.theme);
            req.input("Language", sql.VarChar(50), preferences.language);

            const result = await req.query(query);
            const affected = Array.isArray(result.rowsAffected)
                ? result.rowsAffected[0]
                : result.rowsAffected;
            return affected > 0;
        } catch (err) {
            console.error("InsertPreferences error:", err.message || err);
            return false;
        }
    }


    static async updatePreferences(userId, preferences) {
        await PreferencesDBService.init();
        if (!tablesReady) return false;

        const query = `
        UPDATE Preferences
        SET Theme = @Theme, Language = @Language
        WHERE User_Id = @UserId
    `;

        try {
            const req = PreferencesDBService.pool.request();
            req.input("UserId", sql.VarChar(50), userId);
            req.input("Theme", sql.VarChar(50), preferences.theme);
            req.input("Language", sql.VarChar(50), preferences.language);

            const result = await req.query(query);
            const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
            return affected > 0;
        } catch (err) {
            console.error(`UpdatePreferences error for UserId=${userId}:`, err.message || err);
            return false;
        }
    }

    static async getPreferencesByUserId(userId) {
        await PreferencesDBService.init();
        if (!tablesReady) return null;

        const query = `SELECT * FROM Preferences WHERE User_Id = @UserId`;

        try {
            const req = PreferencesDBService.pool.request();
            req.input("UserId", sql.VarChar(50), userId);

            const result = await req.query(query);
            if (!result.recordset || result.recordset.length === 0) return null;
            return PreferencesDBService.mapRow(result.recordset[0]);
        } catch (err) {
            console.error(`GetPreferencesByUserId error for UserId=${userId}:`, err.message || err);
            return null;
        }
    }
}