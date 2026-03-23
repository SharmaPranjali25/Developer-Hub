import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient} from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authHttpInterceptorFn } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
      authorizationParams:{
        redirect_uri: environment.auth.redirectUri
      }
    }),

  ]
};

// provideAuth0- registers the Auth0 Service.
// provideHttpClient- registers the HttpClient Service and adds the authHttpInterceptorFn to the interceptor chain. 
// authHttpInterceptorFn: This interceptor adds the access token (JWT Token) to outgoing HTTP requests when required.

