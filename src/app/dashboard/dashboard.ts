import { environment } from '../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { GithubService } from '../services/github.service';
import { Issue, Repo } from '../models/github.models';
import { IssueListComponent } from '../issue-list/issue-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IssueListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  allIssues: Issue[] = [];
  filteredIssues: Issue[] = [];
  repos: Repo[] = [];
  selectedRepo: Repo | null = null;

  isLoadingRepos = true;
  isLoadingIssues = false;
  loadError = '';   // shows error message if loading fails

  hasNextPage = false;
  currentPage = 1;
  activeFilter: 'open' | 'closed' | 'pr' = 'open';
  user$: Observable<any>;
  protected environment = environment;

  currentRepoPage = 0;
  reposPerPage = 4;   // 4 repos per page as per your requirement

  // Splits flat repos array into pages of 4
  get repoPages(): Repo[][] {
    const pages: Repo[][] = [];
    for (let i = 0; i < this.repos.length; i += this.reposPerPage) {
      pages.push(this.repos.slice(i, i + this.reposPerPage));
    }
    return pages;
  }

  get currentPageRepos(): Repo[] {
    return this.repoPages[this.currentRepoPage] ?? [];
  }

  constructor(
    private github: GithubService,
    private auth: AuthService
  ) {
    this.user$ = this.auth.user$;
  }

  ngOnInit(): void {
    this.loadRepos();
  }

  loadRepos(): void {
    this.isLoadingRepos = true;
    this.loadError = '';

    const pinnedRepos = environment.github.pinnedRepos;

    // If pinnedRepos exists and has items, use getPinnedRepos
    // Otherwise fall back to getRepos (all repos)
    const repoCall = (pinnedRepos && pinnedRepos.length > 0)
      ? this.github.getPinnedRepos(environment.github.defaultOrg, pinnedRepos)
      : this.github.getRepos(environment.github.defaultOrg);

    repoCall.subscribe({
      next: (repos) => {
        console.log('Repos loaded:', repos); // check DevTools console
        if (repos.length === 0) {
          // Pinned repos all failed — fall back to all repos
          this.loadAllRepos();
        } else {
          this.repos = repos;
          this.isLoadingRepos = false;
        }
      },
      error: (err) => {
        console.error('Failed to load repos:', err);
        this.loadError = 'Failed to load repositories. Check your GitHub token.';
        this.isLoadingRepos = false;
      }
    });
  }

  // Fallback: load ALL repos from GitHub account
  loadAllRepos(): void {
    this.github.getRepos(environment.github.defaultOrg).subscribe({
      next: (repos) => {
        console.log('Fallback repos loaded:', repos);
        this.repos = repos;
        this.isLoadingRepos = false;
      },
      error: (err) => {
        console.error('Fallback also failed:', err);
        this.loadError = 'Cannot connect to GitHub. Token may be expired.';
        this.isLoadingRepos = false;
      }
    });
  }

  selectRepo(repo: Repo): void {
    this.selectedRepo = repo;
    this.allIssues = [];
    this.filteredIssues = [];
    this.currentPage = 1;
    this.activeFilter = 'open';
    this.loadIssues(1, repo.name);
  }

  backToRepos(): void {
    this.selectedRepo = null;
    this.allIssues = [];
    this.filteredIssues = [];
  }

  loadIssues(page: number = 1, repoName?: string): void {
    const repo = repoName ?? this.selectedRepo?.name;
    if (!repo) return;

    this.isLoadingIssues = true;
    this.github.getIssues(environment.github.defaultOrg, repo, page)
      .subscribe({
        next: (result) => {
          if (page === 1) {
            this.allIssues = result.data;
          } else {
            this.allIssues = [...this.allIssues, ...result.data];
          }
          this.hasNextPage = result.hasNextPage;
          this.currentPage = page;
          this.applyFilter();
          this.isLoadingIssues = false;
        },
        error: (err) => {
          console.error('Failed to load issues:', err);
          this.isLoadingIssues = false;
        }
      });
  }

  loadMore(): void {
    this.loadIssues(this.currentPage + 1);
  }

  nextRepoPage(): void {
    if (this.currentRepoPage < this.repoPages.length - 1) {
      this.currentRepoPage++;
    }
  }

  prevRepoPage(): void {
    if (this.currentRepoPage > 0) {
      this.currentRepoPage--;
    }
  }

  trackByRepo(index: number, repo: Repo): number {
    return repo.id;
  }

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

  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin }
    });
  }
}