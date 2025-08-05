import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Language } from '../../types/language';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [TranslateModule, RouterLink, RouterLinkActive, NgOptimizedImage, NgIf, NgForOf],
})
export class NavbarComponent {
  public isLanguageDropdownOpen = false;

  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);

  public toggleLanguageMenu(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  public selectLanguage(language: Language): void {
    this.translateService.use(language.code);
    this.languageService.setSelectedLanguage(language.code);
    this.isLanguageDropdownOpen = false;
  }

  public get selectedLanguageFlag(): string {
    return this.languageService.getSelectedLanguageFlag();
  }

  public get languages(): Language[] {
    return this.languageService.getLanguages();
  }
}
