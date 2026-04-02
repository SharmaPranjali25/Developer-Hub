// // Issue = the interface you defined in github.models.ts
// //`getRepos(owner: string)` — a method that accepts one parameter called `owner` which must be a string. When you call it: `getRepos('microsoft')` — the word `microsoft` becomes `owner` inside the method.

// //`: Observable<Repo[]>` — this is the return type annotation. It tells TypeScript and any developer reading this: "this method returns an Observable that will eventually deliver an array of Repo objects." 
// //The `: ` before `Observable` is TypeScript's way of annotating types on anything — variables, parameters, return values.


// // Component calls:
// // github.getIssues('microsoft', 'vscode', 1)
// //          ↓
// // GithubService builds the URL and calls GitHub's API
// //          ↓
// // GitHub responds with JSON + Link header
// //          ↓
// // .pipe(map(...)) transforms it into PaginatedResult<Issue>
// //          ↓
// // Component receives clean typed data and renders the UI
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, Observable, of, catchError, tap } from 'rxjs';
import { Issue, PullRequest, Repo, PaginatedResult } from '../models/github.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private readonly BASE_URL = 'https://api.github.com';

  // ✅ Cache for repos (prevents repeated API calls)
  private repoCache: Repo[] | null = null;

  constructor(private http: HttpClient) {}

  // ───────── HEADERS ─────────
  private getHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${environment.github.token}`
      })
    };
  }

  // ───────── GET REPOS (FIXED) ─────────
  getRepos(owner: string): Observable<Repo[]> {

    // ✅ Return cache if available
    if (this.repoCache) {
      console.log('Using cached repos');
      return of(this.repoCache);
    }

    console.log('Calling GitHub repos API...');

    return this.http.get<Repo[]>(
      `${this.BASE_URL}/users/${owner}/repos?sort=updated&per_page=20`,
      this.getHeaders()
    ).pipe(
      tap(repos => {
        console.log('Repos API success:', repos);
        this.repoCache = repos;
      }),
      catchError(err => {
        console.error('❌ getRepos failed:', err);

        // ❗ IMPORTANT: don't return empty silently
        throw err;
      })
    );
  }

  // ───────── PINNED REPOS (OPTIMIZED) ─────────
  getPinnedRepos(owner: string, repoNames: string[]): Observable<Repo[]> {
    if (!repoNames || repoNames.length === 0) return of([]);

    return this.getRepos(owner).pipe(
      map(repos => repos.filter(r => repoNames.includes(r.name)))
    );
  }

  // ───────── GET ISSUES (FIXED PAGINATION) ─────────
  getIssues(owner: string, repo: string, page: number = 1): Observable<PaginatedResult<Issue>> {

    console.log(`Fetching issues for ${repo}, page ${page}`);

    return this.http.get<Issue[]>(
      `${this.BASE_URL}/repos/${owner}/${repo}/issues?state=all&page=${page}&per_page=10`,
      { observe: 'response', ...this.getHeaders() }
    ).pipe(
      map((response: HttpResponse<Issue[]>) => {
        const linkHeader = response.headers.get('Link') ?? '';

        return {
          data: response.body ?? [],
          hasNextPage: linkHeader.includes('rel="next"'),
          nextPage: page + 1
        };
      }),
      catchError(err => {
        console.error('❌ getIssues failed:', err);

        // ✅ return safe fallback for UI
        return of({
          data: [],
          hasNextPage: false,
          nextPage: page
        });
      })
    );
  }

  // ───────── GET PULL REQUESTS ─────────
  getPullRequests(owner: string, repo: string, page: number = 1): Observable<PaginatedResult<PullRequest>> {

    return this.http.get<PullRequest[]>(
      `${this.BASE_URL}/repos/${owner}/${repo}/pulls?state=open&page=${page}&per_page=10`,
      { observe: 'response', ...this.getHeaders() }
    ).pipe(
      map((response: HttpResponse<PullRequest[]>) => {
        const linkHeader = response.headers.get('Link') ?? '';

        return {
          data: response.body ?? [],
          hasNextPage: linkHeader.includes('rel="next"'),
          nextPage: page + 1
        };
      }),
      catchError(err => {
        console.error('❌ getPullRequests failed:', err);

        return of({
          data: [],
          hasNextPage: false,
          nextPage: page
        });
      })
    );
  }

  // ───────── GET SINGLE REPO ─────────
  getRepo(owner: string, repo: string): Observable<Repo> {
    return this.http.get<Repo>(
      `${this.BASE_URL}/repos/${owner}/${repo}`,
      this.getHeaders()
    ).pipe(
      catchError(err => {
        console.error('❌ getRepo failed:', err);
        throw err;
      })
    );
  }

  // ───────── CLEAR CACHE (OPTIONAL) ─────────
  clearCache(): void {
    this.repoCache = null;
  }
}