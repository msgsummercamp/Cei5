import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Language } from '../../types/language';
import { Menubar } from 'primeng/menubar';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { IfAuthenticatedDirective } from '../../directives/if-authenticated.directive';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    TranslateModule,
    RouterLink,
    Menubar,
    PrimeTemplate,
    ButtonDirective,
    DropdownModule,
    FormsModule,
    Select,
    NgOptimizedImage,
    IfAuthenticatedDirective,
  ],
})
export class NavbarComponent implements OnInit {
  private readonly _translateService = inject(TranslateService);
  private readonly _authService = inject(AuthService);
  public readonly _languageService = inject(LanguageService);

  private _menuConfig = [{ translationKey: 'home', routerLink: '/' }];

  public items: MenuItem[] = [];

  ngOnInit() {
    this.translateMenuItems();

    this._translateService.onLangChange.subscribe(() => {
      this.translateMenuItems();
    });
  }

  public selectLanguage(language: Language): void {
    this._translateService.use(language.code);
    this._languageService.setSelectedLanguage(language.code);
  }

  public get selectedLanguageFlag(): string {
    return this._languageService.getSelectedLanguageFlag();
  }

  public get languages(): Language[] {
    return this._languageService.getLanguages();
  }

  private translateMenuItems() {
    const keys = this._menuConfig.map((item) => item.translationKey);

    this._translateService.get(keys).subscribe((translations) => {
      this.items = this._menuConfig.map((item) => ({
        label: translations[item.translationKey],
        routerLink: item.routerLink,
      }));
    });
  }
  public isAuthenticated(): boolean {
    return this._authService.isLoggedIn();
  }

  public logout(): void {
    this._authService.logOut();
  }
}
