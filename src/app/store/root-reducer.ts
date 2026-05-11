import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth.slice';
import { uiReducer } from './ui.slice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
