import { Router } from 'express'
import UserController from './user-controller.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { authorization } from '../../middleware/authorization.js';

const userRouter = Router();

userRouter
    .get('/all', authorization, asyncHandler(UserController.getUsers))
    .get('/profile', authorization, asyncHandler(UserController.getProfile))
    .post('/create', asyncHandler(UserController.createUser))
    .post('/login', asyncHandler(UserController.loginUser))
    .post('/recovery', asyncHandler(UserController.sendRecoveryCode))
    .delete('/delete/:id', authorization, asyncHandler(UserController.deleteUser))
    .put('/update/:id', authorization, asyncHandler(UserController.updateUser))
    .put('/update', asyncHandler(UserController.updateUserByEmail))

export default userRouter;