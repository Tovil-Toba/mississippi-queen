import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { environment as env } from '../../environments/environment';
import { PaddleSteamersState } from './paddle-steamers/paddle-steamers.state';
import { TilesState } from './tiles/tiles.state';

@NgModule({
  imports: [
    CommonModule,
    NgxsLoggerPluginModule.forRoot({ logger: console, collapsed: true, disabled: true }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: env.production }),
    NgxsModule.forRoot(
      [
        PaddleSteamersState,
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
