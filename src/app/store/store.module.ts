import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { environment as env } from '../../environments/environment';
import { PaddleStreamersState } from './paddle-streamers/paddle-streamers.state';
import { TilesState } from './tiles/tiles.state';

@NgModule({
  imports: [
    CommonModule,
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: true }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: env.production }),
    NgxsModule.forRoot(
      [
        PaddleStreamersState,
        TilesState,
      ],
      {
        developmentMode: !env.production,
        selectorOptions: {} // empty object to test option merging
      }
    )
  ],
  exports: [
    NgxsLoggerPluginModule,
    NgxsReduxDevtoolsPluginModule,
    NgxsModule
  ]
})
export class NgxsStoreModule {}
