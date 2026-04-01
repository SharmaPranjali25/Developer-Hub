export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

// FIXED: was "label" (lowercase) — now "Label" (uppercase)
export interface Label {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string;
  labels: Label[];   // FIXED: was label[] — now Label[]
  user: GithubUser;
  created_at: string;
  updated_at: string;
  comments: number;
  html_url: string;
  pull_request?: {
    merged_at: string | null;
  };
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string;
  labels: Label[];   // FIXED: was label[] — now Label[]
  user: GithubUser;
  created_at: string;
  updated_at: string;
  comments: number;
  html_url: string;
  draft: boolean;
  merged_at: string | null;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  open_issues_count: number;
  html_url: string;
  private: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
  nextPage: number;
}