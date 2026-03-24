// ✅ Simplified callback.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <p style="color:#6b7280;font-size:14px;">Signing you in...</p>
    </div>
  `
})
export class Callback implements OnInit {

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Auth0 handles callback automatically via app.config.ts
    // Just wait for auth to complete then redirect
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}