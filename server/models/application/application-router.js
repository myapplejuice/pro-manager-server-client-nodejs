import { Router } from "express";
import ApplicationController from "../application/applications-controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authorization } from "../../middleware/authorization.js";

const applicationRouter = Router();

applicationRouter
    .post("/create", authorization, asyncHandler(ApplicationController.createApplication))
    .put("/update", authorization, asyncHandler(ApplicationController.setApplicationStatus))
    .get("/all", authorization, asyncHandler(ApplicationController.fetchAllApplications))
    .get("/:id", authorization, asyncHandler(ApplicationController.fetchUserApplications))
    .get("/:id/:applicationId", authorization, asyncHandler(ApplicationController.fetchApplication))
    .delete("/:applicationId", authorization, asyncHandler(ApplicationController.deleteApplication));

export default applicationRouter;
