import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // ✅ Keep interceptor for Auth0 (for your own backend if needed)
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),

    provideAuth0({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
      authorizationParams: {
        redirect_uri: environment.auth.redirectUri
      },

      // 🚨 FIX: DO NOT attach Auth0 token to GitHub API
      httpInterceptor: {
        allowedList: [
          // ✅ Keep empty OR add ONLY your backend URLs
          // Example:
          // 'http://localhost:8080/api/*'
        ]
      }
    })
  ]
};

// provideAuth0- registers the Auth0 Service.
// provideHttpClient-enables making API Calls.
// authHttpInterceptorFn:This interceptor adds the access token (JWT Token) to outgoing HTTP requests when required.
//                      : automatically attach "login token" tp every API request.

