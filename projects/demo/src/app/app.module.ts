import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMutation } from 'projects/ngx-mutation/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxMutation
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
