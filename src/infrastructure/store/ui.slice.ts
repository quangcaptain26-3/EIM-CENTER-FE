// ui.slice.ts
// Slice quản lý UX / UI chung: Trạng thái Sidebar collapse và trang loading

import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  pageLoading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true, // mặc định Desktop bật
  pageLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: { payload: boolean }) => {
      state.sidebarOpen = action.payload;
    },
    setPageLoading: (state, action: { payload: boolean }) => {
      state.pageLoading = action.payload;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, closeSidebar, setPageLoading } = uiSlice.actions;
export default uiSlice.reducer;
