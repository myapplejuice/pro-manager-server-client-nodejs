import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION_STRING = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    trustedConnection: true,
  }
};

let tablesReady = false;

export default class AffiliationDBService {
  static pool;

  static async init() {
    if (!AffiliationDBService.pool) {
      try {
        AffiliationDBService.pool = await sql.connect(DB_CONNECTION_STRING);
        await AffiliationDBService.validateTablesExistence();
        tablesReady = true;
        console.log("AffiliationDBService: DB connected and table checked/created");
      } catch (err) {
        console.error("AffiliationDBService: DB connection/init error:", err);
        tablesReady = false;
      }
    }
  }

  static async validateTablesExistence() {
    const query = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Affiliations' AND xtype='U')
      BEGIN
        CREATE TABLE dbo.Affiliations (
          Application_Id VARCHAR(50) NOT NULL PRIMARY KEY,
          Coach_Id VARCHAR(50) NOT NULL,
          Athlete_Id VARCHAR(50) NOT NULL
        )
      END
    `;
    await AffiliationDBService.pool.request().query(query);
  }

  static mapAffiliation(record) {
    return {
      applicationId: record.Application_Id,
      coachId: record.Coach_Id,
      athleteId: record.Athlete_Id
    };
  }

  static async insertAffiliation(affiliation) {
    await AffiliationDBService.init();
    if (!tablesReady) return null;

    const query = `
      INSERT INTO Affiliations (Application_Id, Coach_Id, Athlete_Id)
      VALUES (@ApplicationId, @CoachId, @AthleteId)
    `;

    try {
      const request = AffiliationDBService.pool.request();
      request.input('ApplicationId', sql.VarChar(50), affiliation.applicationId);
      request.input('CoachId', sql.VarChar(50), affiliation.coachId);
      request.input('AthleteId', sql.VarChar(50), affiliation.athleteId);

      await request.query(query);
      return await AffiliationDBService.fetchAffiliation(affiliation);
    } catch (err) {
      console.error("AffiliationDBService insertAffiliation error:", err);
      return null;
    }
  }

  static async fetchAllAffiliations() {
    await AffiliationDBService.init();
    if (!tablesReady) return null;

    const query = `SELECT * FROM Affiliations`;

    try {
      const result = await AffiliationDBService.pool.request().query(query);
      return result.recordset.map(AffiliationDBService.mapAffiliation);
    } catch (err) {
      console.error("AffiliationDBService fetchAllAffiliations error:", err);
      return null;
    }
  }

  static async fetchAffiliation(affiliation) {
    await AffiliationDBService.init();
    if (!tablesReady) return null;

    const query = `
      SELECT * FROM Affiliations
      WHERE Coach_Id = @CoachId AND Athlete_Id = @AthleteId
    `;

    try {
      const result = await AffiliationDBService.pool.request()
        .input('CoachId', sql.VarChar(50), affiliation.coachId)
        .input('AthleteId', sql.VarChar(50), affiliation.athleteId)
        .query(query);

      if (result.recordset.length === 0) return null;

      return AffiliationDBService.mapAffiliation(result.recordset[0]);
    } catch (err) {
      console.error("AffiliationDBService fetchAffiliation error:", err);
      return null;
    }
  }

  static async fetchUserAffiliations(id, isCoach) {
    await AffiliationDBService.init();
    if (!tablesReady) return [];

    const query = isCoach
      ? `SELECT * FROM Affiliations WHERE Coach_Id = @Id`
      : `SELECT * FROM Affiliations WHERE Athlete_Id = @Id`;

    try {
      const result = await AffiliationDBService.pool.request()
        .input('Id', sql.VarChar(50), id)
        .query(query);

      return result.recordset.map(AffiliationDBService.mapAffiliation);
    } catch (err) {
      console.error("AffiliationDBService fetchUserAffiliations error:", err);
      return [];
    }
  }

  static async deleteAffiliationById(applicationId) {
    await AffiliationDBService.init();
    if (!tablesReady) return false;

    const query = `DELETE FROM Affiliations WHERE Application_Id = @ApplicationId`;

    try {
      const result = await AffiliationDBService.pool.request()
        .input('ApplicationId', sql.VarChar(50), applicationId)
        .query(query);

      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error("AffiliationDBService deleteAffiliationById error:", err);
      return false;
    }
  }
}
