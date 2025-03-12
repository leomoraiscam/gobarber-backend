import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ResetPasswordService } from '@modules/users/services/ResetPasswordService';

class ResetPasswordController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { password } = request.body;
    const { token } = request.query;
    const resetPasswordService = container.resolve(ResetPasswordService);

    await resetPasswordService.execute({
      password,
      token: token as string,
    });

    return response.status(204).json();
  }
}

export const resetPasswordController = new ResetPasswordController();
