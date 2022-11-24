import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import { AppComponent } from './app.component';
import { ControlComponent } from './control/control.component';
import { NgxsStoreModule } from './store/store.module';
import { PaddleStreamerComponent } from './paddle-streamer/paddle-streamer.component';
import { RiverComponent } from './river/river.component';
import { SpaceComponent } from './space/space.component';
import { TileComponent } from './tile/tile.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    PaddleStreamerComponent,
    RiverComponent,
    SpaceComponent,
    TileComponent,
  ],
  imports: [
    BrowserModule,
    ButtonModule,
    NgxsStoreModule,
    RippleModule,
    TooltipModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
