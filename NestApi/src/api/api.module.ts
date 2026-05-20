import { Module } from '@nestjs/common';
import { HeroesModule } from './heroes/heroes.module';
import { PowersModule } from './powers/powers.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [HeroesModule, PowersModule, SeedModule],
})
export class ApiModule {}
