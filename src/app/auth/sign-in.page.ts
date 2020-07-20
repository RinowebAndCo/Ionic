import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { login } from '../../environments/environment';
import { AuthService } from "../services/auth/auth.service";

@Component({
  selector: 'app-sign-in',
  templateUrl: 'sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
})
export class SignInPage {
  signInForm: FormGroup;
  submitError: string;

  validation_messages = {
    'email': [
      { type: 'required', message: 'L\'adresse mail est requise.' },
      { type: 'pattern', message: 'Entrez une adresse mail valide.' }
    ],
    'password': [
      { type: 'required', message: 'Le mot de passe est requis.' },
      { type: 'minlength', message: 'Le mot de passe doit contenir au moins 6 caractères.' }
    ]
  };

  constructor(
    public router: Router,
    private ngZone: NgZone,
    private auth: AuthService,
  ) {
    this.signInForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ]))
    });

    // Get firebase authentication redirect result invoken when using signInWithRedirect()
    // signInWithRedirect() is only used when client is in web but not desktop
    
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // redirect the user to the profile page
  redirectLoggedUserToProfilePage() {
    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      this.router.navigateByUrl('tabs');
    });
  }


  signIn() {
    if(login.name == this.signInForm.value['email'] && login.pass == this.signInForm.value['password']){
      this.auth.setLoggedIn(true);
      this.redirectLoggedUserToProfilePage();
    } else{
      this.submitError = "Identifiants incorrect";
      this.auth.setLoggedIn(false)
    }
  }
  
}
