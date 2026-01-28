import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	isDarkTheme: false,
};

const themeSlice = createSlice({
	name: 'theme',
	initialState,
	reducers: {
		setDarkTheme(state, action) {
			state.isDarkTheme = !!action.payload;
		},
		toggleTheme(state) {
			state.isDarkTheme = !state.isDarkTheme;
		},
	},
});

export const { setDarkTheme, toggleTheme } = themeSlice.actions;
export const selectIsDarkTheme = (state) => state.theme.isDarkTheme;
export default themeSlice.reducer;
