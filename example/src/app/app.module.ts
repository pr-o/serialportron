import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ElectronService } from './services/electron.service';
import { MainContainerComponent } from './containers/main-container/main-container.component';
import { SerialportronComponent } from './components/serialportron/serialportron.component';

@NgModule({
  imports: [BrowserModule, CommonModule, FormsModule],
  declarations: [AppComponent, MainContainerComponent, SerialportronComponent],
  bootstrap: [AppComponent],
  providers: [ElectronService],
})
export class AppModule {}
