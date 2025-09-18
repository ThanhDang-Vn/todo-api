import { User } from '../entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, (faker) => {
  const user = new User();
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.avatarUrl = faker.image.avatar();

  return user;
});
