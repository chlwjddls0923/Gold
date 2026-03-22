import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SiteSetting } from './site-settings.entity'
import { SiteSettingsService } from './site-settings.service'
import { SiteSettingsController } from './site-settings.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting])],
  providers: [SiteSettingsService],
  controllers: [SiteSettingsController],
})
export class SiteSettingsModule {}
