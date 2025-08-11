import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Language } from '../../types/language';
import { Menubar } from 'primeng/menubar';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { IfAuthenticatedDirective } from '../../directives/if-authenticated.directive';
import { MenuModule } from 'primeng/menu';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    TranslateModule,
    RouterLink,
    Menubar,
    PrimeTemplate,
    DropdownModule,
    FormsModule,
    Select,
    NgOptimizedImage,
    IfAuthenticatedDirective,
    Button,
    MenuModule,
  ],
})
export class NavbarComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _authService = inject(AuthService);
  private readonly _userService = inject(UserService);
  public readonly _languageService = inject(LanguageService);

  //Contains the translated elements for the main navbar
  public navbarMainItems: MenuItem[] = [];

  //Contains the translated elements for the user menu that appears after login
  public userMenuItems: MenuItem[] = [];

  /*The menuConfig contains the links from the navbar in this form: {translationKey: 'navbar.home', routerLink: '/home'} Commenting out for now.
  private _menuConfig = [];
*/
  private _userMenuConfig = [
    { label: 'navbar.profile', routerLink: '/profile' },
    { label: 'navbar.logout', command: () => this.logout() },
  ];

  ngOnInit() {
    this.translateMenuItems(
      this._userMenuConfig,
      (translatedItems) => (this.userMenuItems = translatedItems)
    );

    this._translateService.onLangChange.subscribe(() => {
      this.translateMenuItems(
        this._userMenuConfig,
        (translatedItems) => (this.userMenuItems = translatedItems)
      );
    });
  }

  //initialItems: the array containing the elements to be translated
  //assignNewLanguage: a function that assigns the translated items to the given array
  //This function translates the given items using translations keys and adds them into an array
  private translateMenuItems(
    initialItems: any[],
    assignNewLanguage: (items: MenuItem[]) => void
  ): void {
    const translationKeys = initialItems.map((item) => item.label);

    this._translateService.get(translationKeys).subscribe((translations) => {
      const translatedItems = initialItems.map((item) => ({
        ...item,
        label: translations[item.label],
      }));
      assignNewLanguage(translatedItems);
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

  public isAuthenticated(): boolean {
    return this._authService.isLoggedIn();
  }

  public logout(): void {
    this._authService.logOut();
  }

  public get userName(): string {
    const userDetails = this._userService.userDetails();
    return userDetails?.firstName || '';
  }
}
