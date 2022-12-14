import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

import { AppComponent } from './app.component';
import { ControlComponent } from './control/control.component';
import { FinishDialogComponent } from './finish-dialog/finish-dialog.component';
import { NgxsStoreModule } from './store/store.module';
import { PaddleSteamerComponent } from './paddle-steamer/paddle-steamer.component';
import { RiverComponent } from './river/river.component';
import { SpaceComponent } from './space/space.component';
import { TileComponent } from './tile/tile.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    FinishDialogComponent,
    PaddleSteamerComponent,
    RiverComponent,
    SpaceComponent,
    TileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    ConfirmPopupModule,
    DialogModule,
    NgxsStoreModule,
    RippleModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
