import { environment } from '../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { GithubService } from '../services/github.service';
import { Issue } from '../models/github.models';
import { IssueListComponent } from '../issue-list/issue-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IssueListComponent
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  // ── Data from GitHub ──────────────────────────────────────────
  allIssues: Issue[] = [];
  filteredIssues: Issue[] = [];
  isLoading = true;
  hasNextPage = false;
  currentPage = 1;

  // ── Active filter ─────────────────────────────────────────────
  activeFilter: 'open' | 'closed' | 'pr' = 'open';

  // ── User info from Auth0 ──────────────────────────────────────
  user$: Observable<any>;
  protected environment = environment; // ✅ correct way
repos: any;

  // ── Inject services ───────────────────────────────────────────
  constructor(
    private github: GithubService,
    private auth: AuthService
  ) {
    this.user$ = this.auth.user$;
  }

  // ── ngOnInit ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadIssues();
  }

  // ── Fetch issues from GitHub ──────────────────────────────────
  loadIssues(page: number = 1): void {
    this.isLoading = true;

    this.github.getIssues(
      environment.github.defaultOrg,
      'Developer-Hub',
      page
    ).subscribe({
      next: (result) => {
        if (page === 1) {
          this.allIssues = result.data;
        } else {
          this.allIssues = [...this.allIssues, ...result.data];
        }
        this.hasNextPage = result.hasNextPage;
        this.currentPage = page;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load issues:', err);
        this.isLoading = false;
      }
    });
  }

  // ── Load more ─────────────────────────────────────────────────
  loadMore(): void {
    this.loadIssues(this.currentPage + 1);
  }

  // ── Filter logic ──────────────────────────────────────────────
  setFilter(filter: 'open' | 'closed' | 'pr'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.activeFilter) {
      case 'open':
        this.filteredIssues = this.allIssues.filter(
          i => i.state === 'open' && !i.pull_request
        );
        break;
      case 'closed':
        this.filteredIssues = this.allIssues.filter(
          i => i.state === 'closed'
        );
        break;
      case 'pr':
        this.filteredIssues = this.allIssues.filter(
          i => !!i.pull_request
        );
        break;
    }
  }

  // ── Computed stats ────────────────────────────────────────────
  get openCount(): number {
    return this.allIssues.filter(
      i => i.state === 'open' && !i.pull_request
    ).length;
  }

  get prCount(): number {
    return this.allIssues.filter(i => !!i.pull_request).length;
  }

  get closedCount(): number {
    return this.allIssues.filter(i => i.state === 'closed').length;
  }

  // ── Logout ────────────────────────────────────────────────────
  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin }
    });
  }
}