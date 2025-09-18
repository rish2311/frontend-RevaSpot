import { getFilters, queryDiscover, saveAudience } from '@/services/discover'
import {
  ApiFetchState,
  Audience,
  CreateAudience,
  DiscoverQuery,
  DiscoverQueryResult,
  EmptyValue,
  Filter,
  Operator,
  SavedFilter,
  SelectedFilter,
} from '@/types'
import _ from 'lodash'
import { create } from 'zustand'

export interface DiscoverState {
  allowMultiple: boolean
  loading: boolean
  filters: Filter[]
  selectedFilters: SelectedFilter[]
  resultState: ApiFetchState
  result?: DiscoverQueryResult
  load: () => void
  validResult: () => boolean
  setFilters: (filters: Filter[]) => void
  setSelectedFilters: (filters: SelectedFilter[]) => void
  addSelectedFilter: (filter: SelectedFilter) => void
  removeSelectedFilter: (filter: SelectedFilter) => void
  clearSelectedFilters: () => void
  updateSelectedFilter: (filter: SelectedFilter) => void
  saveAudience: (name: string) => Promise<Audience>
  savingAudience: boolean
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const selectedFilterToQuery = (sf: SelectedFilter[]): DiscoverQuery | undefined => {
  if (sf.length == 0) {
    return
  }

  const obj = sf.reduce((src: any, item) => {
    src[item.filter.name] = {
      values: item.values.map((op) => op.name),
      operator: item.operator,
      empty_value: item.empty_value,
    }
    return src
  }, {})
  return obj
}

const queryDisc = _.debounce(async (getState, setState) => {
  const q = selectedFilterToQuery(getState().selectedFilters)
  if (!q) {
    setState({ resultState: ApiFetchState.EmptyInput, result: undefined })
    return
  }

  try {
    const res = await queryDiscover(q)
    console.log(res)
    setState({ resultState: ApiFetchState.Success, result: res })
  } catch (e) {
    setState({ resultState: ApiFetchState.Failed, result: undefined })
  }
}, 1000)

function hasValidEmptyValue(op: Operator, e: EmptyValue): boolean {
  switch (op) {
    case Operator.In:
      return e === EmptyValue.Include
    case Operator.NotIn:
      return e === EmptyValue.Exclude
  }
  return false
}

const validateFilter = (filter: SelectedFilter): boolean => {
  return hasValidEmptyValue(filter.operator, filter.empty_value) || filter.values.length > 0
}

const isAllValid = (filters: SelectedFilter[]): boolean => {
  return !filters.some((element) => !element.valid)
}

const safeReload = (get: any, set: any) => {
  if (isAllValid(get().selectedFilters)) {
    set({
      resultState: ApiFetchState.Loading,
    })
    queryDisc(get, set)
  }
}

const toSavedFilterType = (selectedFilters: SelectedFilter[]): SavedFilter[] => {
  return selectedFilters.map((f) => {
    return {
      label: f.filter.label,
      name: f.filter.name,
      operator: f.operator,
      values: f.values,
      empty_value: f.empty_value,
    }
  })
}

export const useDiscover = create<DiscoverState>((set, get) => {
  let initPromise: Promise<void> | undefined = undefined
  return {
    savingAudience: false,
    allowMultiple: false,
    loading: true,
    filters: [],
    selectedFilters: [],
    resultState: ApiFetchState.EmptyInput,
    result: undefined,
    validResult: (): boolean => {
      const state = get()
      return (
        (state.resultState === ApiFetchState.Success &&
          state.result &&
          state.result!.sample_data.length > 0) ||
        false
      )
    },
    setFilters: (filters: Filter[]) => set({ filters }),
    setSelectedFilters: (filters: SelectedFilter[]) => {
      set({ selectedFilters: filters })
    },
    saveAudience: async (name?: string) => {
      if (!name) {
        throw 'name is must to save audience'
      }
      const state = get()
      if (!state.savingAudience) {
        try {
          set({ savingAudience: true })
          let req: CreateAudience = {
            name: name,
            query: JSON.stringify({
              version: 'v1',
              filters: toSavedFilterType(state.selectedFilters),
            }),
            target_size: state.result!.stats.count,
            aud_type: 'MARKET',
            query_type: 'JSON',
          }
          const res = await saveAudience(req)
          return res
        } finally {
          set({ savingAudience: false })
        }
      }
      throw 'another save is in progress, wait'
    },
    addSelectedFilter: (filter: SelectedFilter) => {
      const valid = validateFilter(filter)
      filter.valid = valid
      let updated = false
      if (get().allowMultiple) {
        set({
          selectedFilters: [...get().selectedFilters, filter],
        })
        updated = true
      } else {
        if (!get().selectedFilters.some((element) => element.filter.name === filter.filter.name)) {
          set({
            selectedFilters: [...get().selectedFilters, filter],
          })
          updated = true
        }
      }
      if (updated) {
        safeReload(get, set)
      }
    },
    removeSelectedFilter: (filter: SelectedFilter) => {
      set({
        selectedFilters: get().selectedFilters.filter((f) => f.id !== filter.id),
      })
      safeReload(get, set)
    },
    clearSelectedFilters: () => {
      set({ selectedFilters: [] })
    },
    updateSelectedFilter: (filter: SelectedFilter) => {
      const valid = validateFilter(filter)
      filter.valid = valid
      const filters = get().selectedFilters.map((f) => {
        if (f.id === filter.id) {
          return filter
        }
        return f
      })
      set({ selectedFilters: filters })
      safeReload(get, set)
    },

    load: async () => {
      if (initPromise) return initPromise
      initPromise = new Promise(async (resolve, reject) => {
        try {
          set({ loading: true })
          // await timeout(1000)
          const fils = await getFilters()
          //   const response = await fetch("/api/data"); // Replace with your data fetch logic
          //   const result = await response.json();
          set({ filters: fils.data.filters || [], loading: false })
          resolve(undefined)
        } catch (error) {
          console.error('Error loading filters:', error)
          set({ filters: [], loading: false })
          reject(error)
        }
      })
      return initPromise
      // await timeout(1000);
      // set({filters: _filters})
      // set({loading: false})
    },
  }
})

export default useDiscover
