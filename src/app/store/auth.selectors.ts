import type { RootState } from './root-reducer';

export const selectUser = (state: RootState) => state.auth.user;
export const selectRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectPermissions = (state: RootState) => state.auth.user?.permissions ?? [];
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
