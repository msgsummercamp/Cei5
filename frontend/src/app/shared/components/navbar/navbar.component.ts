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

  private readonly _translateService = inject(TranslateService);
  private readonly _languageService = inject(LanguageService);

  public toggleLanguageMenu(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  public selectLanguage(language: Language): void {
    this._translateService.use(language.code);
    this._languageService.setSelectedLanguage(language.code);
    this.isLanguageDropdownOpen = false;
  }

  public get selectedLanguageFlag(): string {
    return this._languageService.getSelectedLanguageFlag();
  }

  public get languages(): Language[] {
    return this._languageService.getLanguages();
  }
}
