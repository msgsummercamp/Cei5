import { Injectable } from '@angular/core';
import { Language } from '../types/language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  private languages: Language[] = [
    { code: 'en', flag: 'assets/flags/en.png' },
    { code: 'ro', flag: 'assets/flags/ro.png' },
  ];

  public getSelectedLanguageFlag(): string {
    return this.languages.find((lang) => lang.code === this.selectedLanguage)?.flag || '';
  }

  public getSelectedLanguageCode(): string {
    return this.selectedLanguage;
  }

  public setSelectedLanguage(languageCode: string): void {
    localStorage.setItem('selectedLanguage', languageCode);
    this.selectedLanguage = languageCode;
  }

  public getLanguages(): { code: string; flag: string }[] {
    return this.languages;
  }
}
