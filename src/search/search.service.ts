import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(keyword: string) {
    const [cards, columns] = await Promise.all([
      this.prisma.card.findMany({
        where: {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        select: {
          title: true,
          id: true,
          columnId: true,
          priority: true,
          description: true,
        },
      }),
      this.prisma.column.findMany({
        where: {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    return {
      cards,
      columns,
    };
  }
}
