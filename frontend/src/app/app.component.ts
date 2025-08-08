import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './shared/services/language.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Toast, TranslateModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private _translateService = inject(TranslateService);
  private _languageService = inject(LanguageService);

  ngOnInit() {
    this._translateService.use(this._languageService.getSelectedLanguageCode());
  }
}
