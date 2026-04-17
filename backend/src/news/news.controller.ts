import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListNewsDto } from './dto/list-news.dto';
import { NewsService } from './news.service';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async list(@Query() query: ListNewsDto) {
    return this.newsService.list(query);
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    return this.newsService.byId(id);
  }
}
