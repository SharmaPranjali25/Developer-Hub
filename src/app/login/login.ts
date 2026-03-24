import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(private auth: AuthService){}
  login(): void{
    this.auth.loginWithRedirect();
  }


}
