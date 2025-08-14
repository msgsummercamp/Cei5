import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { MenuModule } from 'primeng/menu';
import { UserService } from '../../services/user.service';
import { StepNavigationService } from '../../services/step-navigation.service';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { NavbarHelper } from '../../helper/visibile-for-role';
import { Roles } from '../../types/enums/roles';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    TranslateModule,
    Menubar,
    PrimeTemplate,
    DropdownModule,
    FormsModule,
    Select,
    NgOptimizedImage,
    Button,
    MenuModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    RouterLink,
    AccordionContent,
  ],
})
export class NavbarComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _authService = inject(AuthService);
  private readonly _userService = inject(UserService);
  private readonly _router = inject(Router);
  private readonly _stepNavigationService = inject(StepNavigationService);
  public readonly _languageService = inject(LanguageService);

  public isHamburgerMenuOpen = false;

  //Contains the translated elements for the main navbar
  public navbarMainItems: MenuItem[] = [];

  //Contains the translated elements for the user menu that appears after login
  public userMenuItems: MenuItem[] = [];

  /*The menuConfig contains the links from the navbar in this form: {translationKey: 'navbar.home', routerLink: '/home'} Commenting out for now.*/
  private _menuConfig = [
    {
      label: 'navbar.check-flight',
      routerLink: '/form',
      icon: 'pi pi-file-check',
      roles: [Roles.EMPLOYEE, Roles.ADMIN, Roles.USER],
    },
    {
      label: 'navbar.employee-dashboard',
      routerLink: '/employee-dashboard',
      icon: 'pi pi-address-book',
      roles: [Roles.ADMIN, Roles.EMPLOYEE],
    },
    {
      label: 'navbar.admin-table',
      routerLink: '/admin-table',
      icon: 'pi pi-address-book',
      roles: [Roles.ADMIN],
    },
  ];

  private _userMenuConfig = [
    { label: 'navbar.profile', command: () => this.redirectToProfile() },
    { label: 'navbar.logout', command: () => this.logout() },
  ];

  constructor() {
    effect(() => {
      this.translateMenuItems(
        this._userMenuConfig,
        (translatedItems) => (this.userMenuItems = translatedItems)
      );
      this._menuConfig = this._menuConfig.map((item) => ({
        ...item,
        visible: NavbarHelper.isVisibleForAuthUser(item.roles, this._authService),
      }));
      this.translateMenuItems(
        this._menuConfig,
        (translatedItems) => (this.navbarMainItems = translatedItems)
      );
    });

    this._translateService.onLangChange.subscribe(() => {
      this.translateMenuItems(
        this._userMenuConfig,
        (translatedItems) => (this.userMenuItems = translatedItems)
      );
      this.translateMenuItems(
        this._menuConfig,
        (translatedItems) => (this.navbarMainItems = translatedItems)
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

  public redirectToLogin(): void {
    if (this.isHamburgerMenuOpen) {
      this.toggleHamburgerMenu();
    }
    this._stepNavigationService.resetToFirstStep();
    this._router.navigate(['/sign-in']);
  }

  public logout(): void {
    this._stepNavigationService.resetToFirstStep();
    this._authService.logOut();
  }

  public get userName(): string {
    const userDetails = this._userService.userDetails();
    return userDetails?.firstName || '';
  }

  public toggleHamburgerMenu(): void {
    this.isHamburgerMenuOpen = !this.isHamburgerMenuOpen;
  }

  public redirectToProfile(): void {
    this._stepNavigationService.resetToFirstStep();
    this._router.navigate(['/profile']);
  }
}
