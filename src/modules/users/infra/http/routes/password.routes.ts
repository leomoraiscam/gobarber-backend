import { Router } from 'express';
import ForgotPasswordController from '@modules/users/infra/http/controllers/ForgotPasswordController';
import ResetPasswordController from '@modules/users/infra/http/controllers/ResetPasswordController';

const passwordRouter = Router();

passwordRouter.post('/forgot', ForgotPasswordController.create);
passwordRouter.post('/reset', ResetPasswordController.create);

export default passwordRouter;
