import { Card } from '../entities/card.entity';
import { setSeederFactory } from 'typeorm-extension';

export const CardFactory = setSeederFactory(Card, (faker) => {
  const card = new Card();
  card.title = faker.company.name();
  card.description = faker.lorem.sentence();
  card.priority = faker.number.int({ min: 1, max: 4 }).toString();
  card.due_to = faker.date.anytime();

  return card;
});
