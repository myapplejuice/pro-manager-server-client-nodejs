import { Router } from "express";
import PreferencesController from "../preferences/preferences-controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authorization } from "../../middleware/authorization.js";

const preferencesRouter = Router();

preferencesRouter
    .post("/:id", authorization, asyncHandler(PreferencesController.createUserPreferences))
    .put("/:id", authorization, asyncHandler(PreferencesController.setUserPreferences))
    .get("/:id", authorization, asyncHandler(PreferencesController.fetchUserPreferences))

export default preferencesRouter;
