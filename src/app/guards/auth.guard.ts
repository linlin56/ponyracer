import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.currentUser()) {
    return true;
  }
  // redirection vers la page de login si pas connecté
  return router.createUrlTree(['/login']);
};
