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

export default class ApplicationDBService {
  static pool;

  static async init() {
    if (!ApplicationDBService.pool) {
      try {
        ApplicationDBService.pool = await sql.connect(DB_CONNECTION_STRING);
        await ApplicationDBService.validateTablesExistence();
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
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Applications' AND xtype='U')
      BEGIN
        CREATE TABLE dbo.Applications (
          Application_Id VARCHAR(50) NOT NULL PRIMARY KEY,
          Coach_Id VARCHAR(50) NOT NULL,
          Athlete_Id VARCHAR(50) NOT NULL,
          Description NVARCHAR(MAX) NOT NULL,
          Date_Time_Of_Application DATETIME2 NOT NULL,
          Status VARCHAR(50) NOT NULL
        )
      END
    `;
    await ApplicationDBService.pool.request().query(tableCheckQuery);
  }

  static mapRow(row) {
    return {
      applicationId: row.Application_Id,
      coachId: row.Coach_Id,
      athleteId: row.Athlete_Id,
      description: row.Description,
      dateTimeOfApplication: row.Date_Time_Of_Application,
      status: row.Status,
    };
  }

  static async insertApplication(application) {
    await ApplicationDBService.init();
    if (!tablesReady) return null;

    const query = `
      INSERT INTO Applications
      (Application_Id, Coach_Id, Athlete_Id, Description, Date_Time_Of_Application, Status)
      VALUES (@ApplicationId, @CoachId, @AthleteId, @Description, @DateTimeOfApplication, @Status)
    `;

    try {
      const req = ApplicationDBService.pool.request();
      req.input("ApplicationId", sql.VarChar(50), application.applicationId);
      req.input("CoachId", sql.VarChar(50), application.coachId);
      req.input("AthleteId", sql.VarChar(50), application.athleteId);
      req.input("Description", sql.NVarChar(sql.MAX), application.description);
      const dt =
        application.dateTimeOfApplication instanceof Date
          ? application.dateTimeOfApplication
          : new Date(application.dateTimeOfApplication);
      req.input("DateTimeOfApplication", sql.DateTime2, dt);
      req.input("Status", sql.VarChar(50), application.status);

      await req.query(query);

      return await ApplicationDBService.fetchApplication(application.coachId, application.applicationId);
    } catch (err) {
      console.error("InsertApplication error:", err.message || err);
      return null;
    }
  }

  static async setApplicationStatus(newStatusDto) {
    await ApplicationDBService.init();
    if (!tablesReady) return false;

    const query = `
UPDATE Applications
SET Status = @Status
WHERE Application_Id = @ApplicationId
`;

    try {
      const req = ApplicationDBService.pool.request();  // FIXED HERE
      req.input("ApplicationId", sql.VarChar(50), newStatusDto.applicationId);
      req.input("Status", sql.VarChar(50), newStatusDto.status);

      const result = await req.query(query);
      const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
      return affected > 0;
    } catch (err) {
      console.error(`SetApplicationStatus error for ApplicationId=${newStatusDto.applicationId}:`, err.message || err);
      return false;
    }
  }

  static async fetchAllApplications() {
    await ApplicationDBService.init();
    if (!tablesReady) return null;

    const query = `SELECT * FROM Applications`;
    try {
      const result = await ApplicationDBService.pool.request().query(query);  // FIXED HERE
      return (result.recordset || []).map(ApplicationDBService.mapRow);
    } catch (err) {
      console.error("FetchAllApplications error:", err.message || err);
      return null;
    }
  }

  static async fetchApplication(coachId, applicationId) {
    await ApplicationDBService.init();
    if (!tablesReady) return null;

    const query = `SELECT * FROM Applications WHERE Coach_Id = @CoachId AND Application_Id = @ApplicationId`;
    try {
      const req = ApplicationDBService.pool.request();  // FIXED HERE
      req.input("CoachId", sql.VarChar(50), coachId);
      req.input("ApplicationId", sql.VarChar(50), applicationId);

      const result = await req.query(query);
      if (!result.recordset || result.recordset.length === 0) return null;
      return ApplicationDBService.mapRow(result.recordset[0]);
    } catch (err) {
      console.error("FetchApplication error:", err.message || err);
      return null;
    }
  }

  static async fetchUserApplications(id, isCoach = true) {
    await ApplicationDBService.init();
    if (!tablesReady) return [];

    const query = isCoach
      ? `SELECT * FROM Applications WHERE Coach_Id = @Id`
      : `SELECT * FROM Applications WHERE Athlete_Id = @Id`;
    try {
      const req = ApplicationDBService.pool.request();  // FIXED HERE
      req.input("Id", sql.VarChar(50), id);
      const result = await req.query(query);
      return (result.recordset || []).map(ApplicationDBService.mapRow);
    } catch (err) {
      console.error("FetchUserApplications error:", err.message || err);
      return [];
    }
  }

  static async deleteApplication(applicationId) {
    await ApplicationDBService.init();
    if (!tablesReady) return false;

    const query = `DELETE FROM Applications WHERE Application_Id = @ApplicationId`;
    try {
      const req = ApplicationDBService.pool.request();  // FIXED HERE
      req.input("ApplicationId", sql.VarChar(50), applicationId);
      const result = await req.query(query);
      const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
      return affected > 0;
    } catch (err) {
      console.error("DeleteApplication error:", err.message || err);
      return false;
    }
  }
}
