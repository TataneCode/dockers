import { Module } from '@nestjs/common';
import { HeroesService } from './heroes/heroes.service';
import { PowersService } from './powers/powers.service';

@Module({
  providers: [HeroesService, PowersService],
  exports: [HeroesService, PowersService],
})
export class ApplicationModule {}
