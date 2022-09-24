export interface TablePaginationEvent {
  page: number;
  skip: number;
  perPage: number;
  isReset: boolean;
}

export interface TableNavigationEvent {
  status: string;
}
export interface TableSearchEvent {
  query: string;
}

export interface TableRequestEvent {
  status: string | string[];
  page: number;
  perPage: number;
  search?: string;
  source?: string;
  type?: string;
}
