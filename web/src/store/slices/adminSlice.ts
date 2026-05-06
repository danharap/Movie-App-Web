import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AdminUserFilter = {
  search: string;
  role: string;
  status: string;
};

type AdminState = {
  userFilter: AdminUserFilter;
  selectedUserId: string | null;
  analyticsDateRange: 7 | 14 | 30;
};

const initialState: AdminState = {
  userFilter: { search: "", role: "", status: "" },
  selectedUserId: null,
  analyticsDateRange: 30,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setUserFilter(state, action: PayloadAction<Partial<AdminUserFilter>>) {
      state.userFilter = { ...state.userFilter, ...action.payload };
    },
    clearUserFilter(state) {
      state.userFilter = initialState.userFilter;
    },
    setSelectedUser(state, action: PayloadAction<string | null>) {
      state.selectedUserId = action.payload;
    },
    setAnalyticsDateRange(state, action: PayloadAction<7 | 14 | 30>) {
      state.analyticsDateRange = action.payload;
    },
  },
});

export const { setUserFilter, clearUserFilter, setSelectedUser, setAnalyticsDateRange } =
  adminSlice.actions;
export default adminSlice.reducer;
