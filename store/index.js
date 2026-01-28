import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import pumpReducer from './pumpSlice';

export const store = configureStore({
	reducer: {
		theme: themeReducer,
		pump: pumpReducer,
	},
});

export default store;
