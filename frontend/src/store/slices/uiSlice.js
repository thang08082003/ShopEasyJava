import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drawerOpen: false,
  darkMode: false,
  notifications: [],
  loading: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    setDrawer: (state, action) => {
      state.drawerOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { 
  toggleDrawer, 
  setDrawer, 
  toggleDarkMode,
  addNotification,
  clearNotifications,
  setLoading
} = uiSlice.actions;

export default uiSlice.reducer;
