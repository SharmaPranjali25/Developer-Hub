import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authHttpInterceptorFn } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // acts like a CCTV and catches any unexpected errors happening in the browser and logs them.
    provideRouter(routes), // "page navigation": tells what compoents to load when the user navigates to a specific URL.
    provideClientHydration(withEventReplay()), //SSR, makes the page load faster.withEventReplay(): remembers any action the user did before the app fully loads.
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
      authorizationParams: {
        redirect_uri: environment.auth.redirectUri
        // redirect_uri: where to comeback afetr login(localhost:4200).
      }
    }),

  ]
};

// provideAuth0- registers the Auth0 Service.
// provideHttpClient-enables making API Calls.
// authHttpInterceptorFn:This interceptor adds the access token (JWT Token) to outgoing HTTP requests when required.
//                      : automatically attach "login token" tp every API request.

