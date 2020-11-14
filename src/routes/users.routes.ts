import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import CreateUserService from '../services/CreateUserService';
import UpdateUserAvatarService from '../services/UpdateUserAvatarService';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const upload = multer(uploadConfig);

const usersRouter = Router();

usersRouter.post('/', async (request, response) => {
  const { name, email, password } = request.body;

  const createUser = new CreateUserService();

  const user = await createUser.execute({ name, email, password });

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.name,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return response.json(serializedUser);
});

usersRouter.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  async (request, response) => {
    const updateUserAvatar = new UpdateUserAvatarService();
    const user = await updateUserAvatar.execute({
      user_id: request.user.id,
      avatarfilename: request.file.filename,
    });

    const serializedUser = {
      id: user.id,
      name: user.name,
      email: user.name,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return response.json(serializedUser);
  },
);

export default usersRouter;
