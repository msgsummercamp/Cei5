import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { LanguageService } from './shared/services/language.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { updatePreset } from '@primeng/themes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Toast, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly _languageService = inject(LanguageService);

  ngOnInit() {
    this._languageService.initializeLanguage();
    updatePreset({
      semantic: {
        primary: {
          50: '#E8EBF5',
          100: '#C5CCE8',
          200: '#A1ADD9',
          300: '#7D8ECA',
          400: '#5A6FBC',
          500: '#0F1B58F7',
          600: '#0D174E',
          700: '#0B1344',
          800: '#090F3A',
          900: '#070B30',
          950: '#050826',
        },
      },
    });
  }
}
