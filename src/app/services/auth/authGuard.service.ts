import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
 
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
 
  constructor(private auth : AuthService, private router: Router) {}
 
  async canActivate() {
    let value = await this.auth.isAuthenticated()
    // console.log('canActivate',value)
    if (!value) {
      this.router.navigateByUrl("/sign-in")
    }
    return value
  }
}