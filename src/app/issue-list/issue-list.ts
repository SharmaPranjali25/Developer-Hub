import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Issue } from '../models/github.models';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-list.html',
  styleUrl: './issue-list.scss'
})
export class IssueListComponent {

  // @Input() means this property is set FROM OUTSIDE this component
  // The dashboard passes its filteredIssues array in here via
  // [issues]="filteredIssues" in dashboard.component.html
  @Input() issues: Issue[] = [];

  // Helper method — returns true if this issue is actually a PR
  isPullRequest(issue: Issue): boolean {
    return !!issue.pull_request;
  }

  // Helper — formats the date into a readable string like "2 days ago"
  timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

}