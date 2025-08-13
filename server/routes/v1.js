import { Router } from 'express';
import userRouter from '../models/user/user-router.js';
import applicationRouter from '../models/application/application-router.js';
import affiliationRouter from '../models/affiliation/affiliation-router.js';
import preferencesRouter from '../models/preferences/preferences-router.js';

const V1_ROUTER = new Router();
V1_ROUTER.use('/user', userRouter);
V1_ROUTER.use('/application', applicationRouter);
V1_ROUTER.use('/affiliation', affiliationRouter);
V1_ROUTER.use('/preferences', preferencesRouter);

export default V1_ROUTER;