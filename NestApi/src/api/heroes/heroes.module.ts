import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { HeroesController } from './heroes.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [HeroesController],
})
export class HeroesModule {}
