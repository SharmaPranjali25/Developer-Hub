//This service calls Github's API and returns data.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Issue, PullRequest, Repo , PaginatedResult} from '../models/github.models';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GithubService {
    private readonly BASE_URL = 'https://api.github.com';
    // Add this inside the GithubService class, before the constructor
private getHeaders(): { headers: HttpHeaders } {
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${environment.github.token}`,
      'Accept': 'application/vnd.github.v3+json'
    })
  };
}
    constructor(private http: HttpClient){}
    //---- Get all repositories for an organisation-----
    // this URL will list alll repos for this user/org, show most recently updated first, return 20 repos per page.
    getRepos(owner: string):Observable<Repo[]>{
        return this.http.get<Repo[]>(
    `${this.BASE_URL}/users/${owner}/repos?sort=updated&per_page=20`,
    this.getHeaders()
);
}

// ---get issues for specific repo---
getIssues(
    owner: string,
    repo: string,
    page: number = 1         // default to page 1 if not specified
  ): Observable<PaginatedResult<Issue>> {

    // observe: 'response' tells HttpClient to give us the FULL HTTP response
   return this.http.get<Issue[]>(
    `${this.BASE_URL}/repos/${owner}/${repo}/issues?state=open&page=${page}&per_page=30`,
    { observe: 'response', ...this.getHeaders() }
).pipe(
      // .pipe(map(...)) transforms the raw HTTP response into our
      // PaginatedResult shape before the component receives it
      map((response: HttpResponse<Issue[]>) => {
        const issues = response.body ?? []; 
        const linkHeader = response.headers.get('Link') ?? '';

        return {
          data: issues,
          hasNextPage: linkHeader.includes('rel="next"'),
        
          nextPage: page + 1
        };
      })
    );
  }
  //---pull request for specific repo---
    getPullRequests(
    owner: string,
    repo: string,
    page: number = 1
  ): Observable<PaginatedResult<PullRequest>> {

   return this.http.get<PullRequest[]>(
    `${this.BASE_URL}/repos/${owner}/${repo}/pulls?state=open&page=${page}&per_page=30`,
    { observe: 'response', ...this.getHeaders() }
).pipe(
      map((response: HttpResponse<PullRequest[]>) => {
        const prs = response.body ?? [];
        const linkHeader = response.headers.get('Link') ?? '';

        return {
          data: prs,
          hasNextPage: linkHeader.includes('rel="next"'),
          nextPage: page + 1
        };
      })
    );
  }

  // get single repo details
   getRepo(owner: string, repo: string): Observable<Repo> {
    return this.http.get<Repo>(
    `${this.BASE_URL}/repos/${owner}/${repo}`,
    this.getHeaders()
);
  }


}

// Issue = the interface you defined in github.models.ts
//`getRepos(owner: string)` — a method that accepts one parameter called `owner` which must be a string. When you call it: `getRepos('microsoft')` — the word `microsoft` becomes `owner` inside the method.

//`: Observable<Repo[]>` — this is the return type annotation. It tells TypeScript and any developer reading this: "this method returns an Observable that will eventually deliver an array of Repo objects." 
//The `: ` before `Observable` is TypeScript's way of annotating types on anything — variables, parameters, return values.


// Component calls:
// github.getIssues('microsoft', 'vscode', 1)
//          ↓
// GithubService builds the URL and calls GitHub's API
//          ↓
// GitHub responds with JSON + Link header
//          ↓
// .pipe(map(...)) transforms it into PaginatedResult<Issue>
//          ↓
// Component receives clean typed data and renders the UI