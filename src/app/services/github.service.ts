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
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, Observable, forkJoin, of, catchError } from 'rxjs';
import { Issue, PullRequest, Repo, PaginatedResult } from '../models/github.models';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private readonly BASE_URL = 'https://api.github.com';

  constructor(private http: HttpClient) {}

  // ✅ FIX: NO Authorization header (public GitHub APIs)
  private getHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Accept': 'application/vnd.github.v3+json'
      })
    };
  }

  // ── Get all repos ─────────────────────────────────────────────
  getRepos(owner: string): Observable<Repo[]> {
    return this.http.get<Repo[]>(
      `${this.BASE_URL}/users/${owner}/repos?sort=updated&per_page=100`,
      this.getHeaders()
    ).pipe(
      catchError(err => {
        console.error('getRepos failed:', err);
        return of([]);
      })
    );
  }

  // ── Get pinned repos ──────────────────────────────────────────
  getPinnedRepos(owner: string, repoNames: string[]): Observable<Repo[]> {
    if (!repoNames || repoNames.length === 0) return of([]);

    const requests = repoNames.map(name =>
      this.http.get<Repo>(
        `${this.BASE_URL}/repos/${owner}/${name}`,
        this.getHeaders()
      ).pipe(
        catchError(err => {
          console.error(`Failed to load repo ${name}:`, err);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.filter((r): r is Repo => r !== null))
    );
  }

  // ── Get issues ────────────────────────────────────────────────
  getIssues(owner: string, repo: string, page: number = 1): Observable<PaginatedResult<Issue>> {
    return this.http.get<Issue[]>(
      `${this.BASE_URL}/repos/${owner}/${repo}/issues?state=all&page=${page}&per_page=20`,
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
        console.error('getIssues failed:', err);
        return of({ data: [], hasNextPage: false, nextPage: 1 });
      })
    );
  }

  // ── Get pull requests ─────────────────────────────────────────
  getPullRequests(owner: string, repo: string, page: number = 1): Observable<PaginatedResult<PullRequest>> {
    return this.http.get<PullRequest[]>(
      `${this.BASE_URL}/repos/${owner}/${repo}/pulls?state=open&page=${page}&per_page=20`,
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
        console.error('getPullRequests failed:', err);
        return of({ data: [], hasNextPage: false, nextPage: 1 });
      })
    );
  }

  // ── Get single repo ───────────────────────────────────────────
  getRepo(owner: string, repo: string): Observable<Repo> {
    return this.http.get<Repo>(
      `${this.BASE_URL}/repos/${owner}/${repo}`,
      this.getHeaders()
    ).pipe(
      catchError(err => {
        console.error('getRepo failed:', err);
        return of(null as any);
      })
    );
  }

  // ── Get issues from multiple repos ────────────────────────────
  getIssuesForRepos(owner: string, repoNames: string[]): Observable<Issue[]> {
    if (!repoNames || repoNames.length === 0) return of([]);

    const requests = repoNames.map(repo =>
      this.http.get<Issue[]>(
        `${this.BASE_URL}/repos/${owner}/${repo}/issues?state=all&per_page=5`,
        this.getHeaders()
      ).pipe(
        catchError(() => of([]))
      )
    );

    return forkJoin(requests).pipe(
      map((results: Issue[][]) => results.flat())
    );
  }
}