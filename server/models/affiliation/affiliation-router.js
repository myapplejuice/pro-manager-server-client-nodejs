import { Router } from "express";
import AffiliationController from "./affiliation-controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authorization } from "../../middleware/authorization.js";

const affiliationRouter = Router();

affiliationRouter
    .post("/create", authorization, asyncHandler(AffiliationController.createAffiliation))
    .get("/all", authorization, asyncHandler(AffiliationController.fetchAllAffiliations))
    .get("/:id", authorization, asyncHandler(AffiliationController.fetchUserAffiliations))
    .delete("/:applicationId", authorization, asyncHandler(AffiliationController.endAffiliation));

export default affiliationRouter;
