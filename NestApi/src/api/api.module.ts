import { Module } from '@nestjs/common';
import { HeroesModule } from './heroes/heroes.module';
import { PowersModule } from './powers/powers.module';

@Module({
  imports: [HeroesModule, PowersModule],
})
export class ApiModule {}
