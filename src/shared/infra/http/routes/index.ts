import { Router } from 'express';
import { appointmentRouter } from '@modules/appointments/infra/http/routes/appointments.routes';
import { providerRoutes } from '@modules/appointments/infra/http/routes/providers.routes';
import { userRouter } from '@modules/users/infra/http/routes/users.routes';
import { sessionRouter } from '@modules/users/infra/http/routes/sessions.routes';
import { passwordRouter } from '@modules/users/infra/http/routes/password.routes';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/auth', sessionRouter);
routes.use('/password', passwordRouter);
routes.use('/appointments', appointmentRouter);
routes.use('/providers', providerRoutes);

export default routes;
