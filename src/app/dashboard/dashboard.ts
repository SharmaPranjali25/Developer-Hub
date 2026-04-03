import { environment } from '../../environments/environment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, Subscription } from 'rxjs';
import { GithubService } from '../services/github.service';
import { Issue, Repo } from '../models/github.models';
import { IssueListComponent } from '../issue-list/issue-list';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IssueListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  allIssues: Issue[] = [];
  filteredIssues: Issue[] = [];
  repo: Repo | null = null;

  isLoadingRepo = true;
  isLoadingIssues = false;
  loadError = '';

  hasNextPage = false;
  currentPage = 1;
  activeFilter: 'open' | 'closed' | 'pr' = 'open';

  searchQuery = '';

  user$: Observable<any>;
  protected environment = environment;

  // ── Multi-repo support ──
  pinnedRepos = environment.github.pinnedRepos;
  selectedRepo = environment.github.defaultRepo;
  get repoName(): string { return this.selectedRepo; }

  private issuesSub?: Subscription;

  constructor(
    private github: GithubService,
    private auth: AuthService
  ) {
    this.user$ = this.auth.user$;
  }

  ngOnInit(): void {
    this.loadRepo();
  }

  ngOnDestroy(): void {
    this.issuesSub?.unsubscribe();
  }

  // ───────── SELECT REPO ─────────
  selectRepo(repo: string): void {
    if (this.selectedRepo === repo) return;
    this.selectedRepo = repo;
    this.allIssues = [];
    this.filteredIssues = [];
    this.currentPage = 1;
    this.activeFilter = 'open';
    this.searchQuery = '';
    this.loadRepo();
  }

  // ───────── LOAD SINGLE REPO ─────────
  loadRepo(): void {
    this.isLoadingRepo = true;
    this.loadError = '';

    this.github.getRepo(environment.github.defaultOrg, this.selectedRepo).subscribe({
      next: (repo) => {
        this.repo = repo;
        this.isLoadingRepo = false;
        this.loadIssues(1);
      },
      error: (err) => {
        console.error('Failed to load repo:', err);
        this.loadError = 'Failed to load repository';
        this.isLoadingRepo = false;
        // Still try to load issues even if repo meta fails
        this.loadIssues(1);
      }
    });
  }

  // ───────── LOAD ISSUES ─────────
  loadIssues(page: number = 1): void {
    this.issuesSub?.unsubscribe();
    this.isLoadingIssues = true;

    this.issuesSub = this.github.getIssues(environment.github.defaultOrg, this.selectedRepo, page)
      .subscribe({
        next: (result) => {
          if (page === 1) {
            this.allIssues = result.data;
          } else {
            this.allIssues = [...this.allIssues, ...result.data];
          }

          this.hasNextPage = result.hasNextPage;
          this.currentPage = result.nextPage;

          this.applyFilter();
          this.isLoadingIssues = false;
        },
        error: (err) => {
          console.error('Failed to load issues:', err);
          this.isLoadingIssues = false;
        }
      });
  }

  // ───────── LOAD MORE ─────────
  loadMore(): void {
    this.loadIssues(this.currentPage);
  }

  // ───────── FILTER ─────────
  setFilter(filter: 'open' | 'closed' | 'pr'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let base: Issue[];

    switch (this.activeFilter) {
      case 'open':
        base = this.allIssues.filter(i => i.state === 'open' && !i.pull_request);
        break;
      case 'closed':
        base = this.allIssues.filter(i => i.state === 'closed');
        break;
      case 'pr':
        base = this.allIssues.filter(i => !!i.pull_request);
        break;
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      base = base.filter(i => i.title.toLowerCase().includes(q));
    }

    this.filteredIssues = base;
  }

  onSearch(): void {
    this.applyFilter();
  }

  // ───────── COUNTS ─────────
  get openCount(): number {
    return this.allIssues.filter(i => i.state === 'open' && !i.pull_request).length;
  }

  get prCount(): number {
    return this.allIssues.filter(i => !!i.pull_request).length;
  }

  get closedCount(): number {
    return this.allIssues.filter(i => i.state === 'closed').length;
  }

  get closedThisWeekCount(): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return this.allIssues.filter((i: any) =>
    i.state === 'closed' && i.closed_at && new Date(i.closed_at) >= oneWeekAgo
  ).length;
}

  // ───────── LOGOUT ─────────
  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin }
    });
  }
}