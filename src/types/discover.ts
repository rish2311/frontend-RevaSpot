export interface LabelValue {
  label: string
  name: string
}

export interface FilterOption {
  type: string | 'static' | 'dynamic'
  values?: LabelValue[] | string[] | undefined
  fetch_url?: string | undefined
}

export interface Filter {
  name: string
  label: string
  options?: FilterOption | undefined
  items?: Filter[] | undefined
}

export enum Operator {
  In = 'in',
  NotIn = 'not in',
}

export enum EmptyValue {
  Include = 'include',
  Exclude = 'exclude',
}

export interface SelectedFilter {
  id: string
  valid: boolean
  enabled: boolean
  filter: Filter
  values: LabelValue[]
  operator: Operator
  empty_value: EmptyValue
}

export interface SavedFilter {
  label: string
  name: string
  operator: Operator
  values: LabelValue[]
  empty_value: EmptyValue
}

export interface Filter {
  operator: Operator
  values: string[]
  empty_value: EmptyValue
}

export interface DiscoverQuery extends Map<string, Filter> {}

export interface DiscoverQueryResult {
  sample_data: any[]
  stats: {
    count: number
  }
}

export interface Audiences {
  data: Audience[]
  has_more: boolean
}

export interface CreateAudience {
  name: string
  query: string
  target_size: number
  aud_type?: string
  query_type?: string
}

export interface Audience {
  id?: number | string | undefined
  name: string
  exports: Export[]
  query: string
  created_at: Date
  target_size: number
  export_offset: number
  export_in_progress: number
}

export interface Export {
  status: string
  id: string
  offset: number
  progress: number
  size: number
  updated_at: Date
  created_at: Date
}
