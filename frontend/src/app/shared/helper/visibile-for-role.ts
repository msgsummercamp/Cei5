import { AuthService } from '../services/auth/auth.service';

export class NavbarHelper {
  public static isVisibleForAuthUser(visibleForRoles: string[], authService: AuthService): boolean {
    if (!authService.isLoggedIn()) {
      return false;
    }
    const userRole = authService.userRole();
    return visibleForRoles.includes(userRole);
  }
}
