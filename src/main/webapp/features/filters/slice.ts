import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { RootState } from '../../store';
import {
  MaintainerListItemView,
  ComponentTypeListItemView,
  ComponentListItemView
} from '../../services';
import { equals, length } from 'ramda';

type Filters = {
  components: string[];
  componentTypes: string[];
  maintainers: string[];
};

export enum FilterStatus {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  ERROR = 'ERROR'
}

export interface SetFilterPayload {
  name: 'componentTypes' | 'maintainers' | 'components';
  value: string[];
}

export interface FilterPayload {
  components: ComponentListItemView[];
  componentTypes: ComponentTypeListItemView[];
  maintainers: MaintainerListItemView[];
}

interface FilterState {
  components: ComponentListItemView[];
  componentTypes: ComponentTypeListItemView[];
  filters: Filters;
  maintainers: MaintainerListItemView[];
  status: FilterStatus;
  error: string | null;
}

const initialState: FilterState = {
  components: [],
  componentTypes: [],
  filters: {
    components: [],
    componentTypes: [],
    maintainers: []
  },
  error: null,
  maintainers: [],
  status: FilterStatus.FETCHING
};

export const slice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    getInitial: (state) => {
      state.status = FilterStatus.FETCHING;
      state.error = null;
    },
    getInitialSuccess: (state, action: PayloadAction<FilterPayload>) => {
      state.components = action.payload.components;
      state.componentTypes = action.payload.componentTypes;
      state.maintainers = action.payload.maintainers;
      state.status = FilterStatus.IDLE;
      state.error = null;
    },
    getInitialFailure: (state, action: PayloadAction<string>) => {
      state.status = FilterStatus.ERROR;
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<SetFilterPayload>) => {
      state.filters[action.payload.name] = action.payload.value;
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {
        components: [],
        componentTypes: [],
        maintainers: []
      };
    }
  }
});

export const { actions, reducer } = slice;

const getComponents = (state: RootState) => state.filters.components;
const getComponentCount = createSelector([getComponents], length);
const getComponentTypes = (state: RootState) => state.filters.componentTypes;
const getFilters = (state: RootState) => state.filters.filters;
const getMaintainers = (state: RootState) => state.filters.maintainers;

const getStatus = (state: RootState) => state.filters.status;

const getError = (state: RootState) => state.filters.error;

const getIsFetching = createSelector<RootState, FilterStatus, boolean>(
  [getStatus],
  equals<FilterStatus>(FilterStatus.FETCHING)
);

export const selectors = {
  getComponentCount,
  getComponents,
  getComponentTypes,
  getError,
  getFilters,
  getIsFetching,
  getMaintainers,
  getStatus
};
