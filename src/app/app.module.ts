import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {TransactionsComponent} from './transactions/transactions.component';
import {FormsModule} from '@angular/forms';
// import {MatProgressBarModule} from '@angular/material/progress-bar';

import {D3Service, D3_DIRECTIVES} from './d3';

import {GraphComponent} from './visuals/graph/graph.component';
import {SHARED_VISUALS} from './visuals/shared';


@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    GraphComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES

  ],
  imports: [
    BrowserModule,
    FormsModule,
    // MatProgressBarModule
  ],
  providers: [D3Service],
  bootstrap: [AppComponent]
})
export class AppModule {
}
