import { inject, Injectable } from '@angular/core';
import { Language } from '../types/language';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  private readonly _translationService = inject(TranslateService);
  private readonly _primeNg = inject(PrimeNG);

  private languages: Language[] = [
    { code: 'en', flag: 'assets/photos/flags/en.png' },
    { code: 'ro', flag: 'assets/photos/flags/ro.png' },
  ];

  public initializeLanguage(): void {
    this._translationService.addLangs(['en', 'ro']);
    this._translationService.use(this.selectedLanguage).subscribe(() => {
      this._translationService.get('primeng').subscribe((res) => this._primeNg.setTranslation(res));
    });
  }

  public getSelectedLanguageFlag(): string {
    return this.languages.find((lang) => lang.code === this.selectedLanguage)?.flag || '';
  }

  public getSelectedLanguageCode(): string {
    return this.selectedLanguage;
  }

  public setSelectedLanguage(languageCode: string): void {
    localStorage.setItem('selectedLanguage', languageCode);
    this.selectedLanguage = languageCode;
    this._translationService.use(languageCode).subscribe(() => {
      this._translationService.get('primeng').subscribe((res) => this._primeNg.setTranslation(res));
    });
  }

  public getLanguages(): { code: string; flag: string }[] {
    return this.languages;
  }
}
