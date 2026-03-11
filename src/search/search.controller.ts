import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  search(@Query() query: SearchQueryDto) {
    return this.searchService.globalSearch(query.q);
  }
}
