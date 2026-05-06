import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  userDetailDrawerOpen: boolean;
  confirmDeleteUserId: string | null;
  toastMessage: string | null;
  toastType: "success" | "error" | "info";
};

const initialState: UiState = {
  userDetailDrawerOpen: false,
  confirmDeleteUserId: null,
  toastMessage: null,
  toastType: "info",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openUserDrawer(state) {
      state.userDetailDrawerOpen = true;
    },
    closeUserDrawer(state) {
      state.userDetailDrawerOpen = false;
    },
    setConfirmDelete(state, action: PayloadAction<string | null>) {
      state.confirmDeleteUserId = action.payload;
    },
    showToast(
      state,
      action: PayloadAction<{ message: string; type?: "success" | "error" | "info" }>,
    ) {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type ?? "info";
    },
    clearToast(state) {
      state.toastMessage = null;
    },
  },
});

export const { openUserDrawer, closeUserDrawer, setConfirmDelete, showToast, clearToast } =
  uiSlice.actions;
export default uiSlice.reducer;
