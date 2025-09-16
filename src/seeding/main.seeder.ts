import { faker } from '@faker-js/faker';
import { Card } from '../entities/card.entity';
import { ColumnTask } from '../entities/column.entity';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get(User);
    const cardFactory = factoryManager.get(Card);
    const columnFactory = factoryManager.get(ColumnTask);

    const users = await userFactory.saveMany(10);
    console.log('Completed seeding user data...');

    const columns = await Promise.all(
      Array(50)
        .fill('')
        .map(async () => {
          const column = await columnFactory.make({
            user: faker.helpers.arrayElement(users),
            cards: await cardFactory.saveMany(10),
          });

          return column;
        }),
    );

    console.log('Completed seeding column data...');

    const columnRepo = dataSource.getRepository(ColumnTask);
    await columnRepo.save(columns);

    console.log('Completed seeding procedure');
  }
}
