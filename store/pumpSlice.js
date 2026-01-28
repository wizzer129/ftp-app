import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	selectedPump: null,
};

const pumpSlice = createSlice({
	name: 'pump',
	initialState,
	reducers: {
		setSelectedPump(state, action) {
			state.selectedPump = action.payload;
		},
		clearSelectedPump(state) {
			state.selectedPump = null;
		},
	},
});

export const { setSelectedPump, clearSelectedPump } = pumpSlice.actions;
export const selectSelectedPump = (state) => state.pump?.selectedPump || null;

export default pumpSlice.reducer;
