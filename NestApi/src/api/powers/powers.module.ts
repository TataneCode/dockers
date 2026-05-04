import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { PowersController } from './powers.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [PowersController],
})
export class PowersModule {}
