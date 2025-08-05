import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export type Language = {
  code: string;
  flag: string;
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [TranslateModule, RouterLink, RouterLinkActive, NgOptimizedImage, NgIf, NgForOf],
})
export class NavbarComponent {
  public isDropdownOpen = false;
  private translateService = inject(TranslateService);
  private selectedLanguage = 'en';

  public readonly languages: Language[] = [
    { code: 'en', flag: 'assets/flags/en.png' },
    { code: 'ro', flag: 'assets/flags/ro.png' },
  ];

  public toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  public selectLanguage(language: Language): void {
    this.translateService.use(language.code);
    this.selectedLanguage = language.code;
    this.isDropdownOpen = false;
  }

  public getSelectedLanguageFlag(): string {
    return this.languages.find((lang) => lang.code === this.selectedLanguage)?.flag || '';
  }
}
