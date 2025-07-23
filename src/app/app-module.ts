import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { App } from './app';
import { IdeaForm } from './components/idea-form/idea-form';
import { IdeaList } from './components/idea-list/idea-list';

@NgModule({
  declarations: [
    App,
    IdeaForm,
    IdeaList
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {}
