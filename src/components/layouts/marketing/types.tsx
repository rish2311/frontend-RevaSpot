import { TreeDataItem } from '@/components/ui/tree-view'
import { Filter, SelectedFilter } from '@/types'

export interface FiltersProps extends FilterMenuProps {}

export interface TreeDataItemX extends TreeDataItem {
  filter: Filter
}

export interface SelectedFiltersProps {
  filters: SelectedFilter[]
  onDelete?: (filter: SelectedFilter) => void
  onChange?: (filter: SelectedFilter) => void
}

export interface SelectedFilterProps extends SelectedFiltersProps {
  filter: SelectedFilter
}

export interface FilterMenuProps {
  filters: Filter[]
  onSelect: (filter: Filter) => void
  className?: string
}
