import { Injectable } from '@angular/core';
import { Language } from '../types/language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private selectedLanguage = 'en';
  private languages: Language[] = [
    { code: 'en', flag: 'assets/flags/en.png' },
    { code: 'ro', flag: 'assets/flags/ro.png' },
  ];

  public getSelectedLanguageFlag(): string {
    return this.languages.find((lang) => lang.code === this.selectedLanguage)?.flag || '';
  }

  public setSelectedLanguage(languageCode: string): void {
    this.selectedLanguage = languageCode;
  }

  public getLanguages(): { code: string; flag: string }[] {
    return this.languages;
  }
}
