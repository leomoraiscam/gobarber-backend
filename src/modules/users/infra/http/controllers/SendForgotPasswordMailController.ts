import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { SendForgotPasswordMailService } from '@modules/users/services/SendForgotPasswordMailService';

export default new (class SendForgotPasswordMailController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;
    const sendForgotPasswordMailService = container.resolve(
      SendForgotPasswordMailService,
    );

    await sendForgotPasswordMailService.execute(email);

    return response.status(200).json();
  }
})();
