import { ColumnTask } from '../entities/column.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ColumnFactory = setSeederFactory(ColumnTask, (faker) => {
  const column = new ColumnTask();
  column.title = faker.company.name();
  return column;
});
