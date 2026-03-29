// it will define the SHAPE of every object GitHub send back .
//Typescript interface: catch the mistakes before they reach to the browser.

//GithubUser: person who opened the issue, created the repo, or commented on the issue.
export interface GithubUser {
  login: string; // username of the user.
  avatar_url: string; // URL of the user's profile picture.
  html_url: string; // URL of the user's GitHub profile.
}

export interface label{
    id: number;
    name : string;
    color: string;
    description: string;        
}

// for single github issue
export interface Issue {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed';
    body: string;
    labels: label[];
    user: GithubUser;
    created_at: string;
    updated_at: string;
    comments: number; //how many commenst on the issue.
    html_url: string; //link to the issue on GitHub.
    pull_request?:{
        merged_at: string | null; //if the issue is a pull request, this field will be present and will indicate when the pull request was merged. If it's null, it means the pull request is still open or was closed without merging.
    };
}

// A Pull Request (very similar to Issue — GitHub's API treats them similarly)
export interface PullRequest {
    id:number;
    number:number;
    title:string;
    state: 'open' | 'closed';
    body:string;
    labels: label[];
    user: GithubUser;
    created_at:string;
    updated_at:string;
    comments:number; 
    html_url:string;
    draft: boolean; //true is it is a draft PR
    merged_at: string | null; //if the pull request is merged, this field will indicate when it was merged. If it's null, it means the pull request is still open or was closed without merging.
}

//A github Repository
export interface Repo{
    id: number;
    name: string;
    full_name: string;
    description: string;
    language: string;
    open_issues_count: number;
    html_url: string;
    private: boolean;
}

//this is what our service return along with data-
// it tells whetehr more page exist for load more 
export interface PaginatedResult<T>{
    data: T[]; //actual array of issues/PRs/Repos
    hasNextPage: boolean;
    nextPage: number; //which page to fetch next.
}