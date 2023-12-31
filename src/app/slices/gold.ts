import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store/store';
import { selectEmployees, update } from './employee';
import { CONSTANTS, SLICE_NAMES } from '../utils/constants';
import { addMessage } from './hud';

export interface IGoldState {
	total: number;
	multiplier: number;
}

const initialState: IGoldState = {
	total: CONSTANTS.GOLD_INITIAL_VALUE,
	multiplier: CONSTANTS.GOLD_INITIAL_MULTIPLIER,
};

export const goldSlice = createSlice({
	name: SLICE_NAMES.GOLD,
	initialState,
	reducers: {
		increment: (state: IGoldState, action: PayloadAction<number>) => {
			const value = state.total + action.payload * state.multiplier;
			return {
				...state,
				total: value,
			};
		},
		upgrade: (
			state: IGoldState,
			action: PayloadAction<{ cost: number; multiplier: number }>
		) => {
			const { cost, multiplier } = action.payload;
			return {
				...state,
				total: state.total - cost,
				multiplier: state.multiplier + multiplier,
			};
		},
	},
});

export const selectGold = (state: RootState): IGoldState => state.gold;

export const upgradeBroughtEmployee =
	(index: number): AppThunk =>
	(dispatch, getState) => {
		const employees = selectEmployees(getState());
		const { total } = selectGold(getState());

		const employee = employees[index];

		if (employee) {
			if (total < employee.cost) {
				dispatch(addMessage({
					type: 'error',
					content: `Failed to hire ${employee.name}, ${CONSTANTS.HUD_NO_ENOUGH_MONEY}`,
					time: Date.now(),
				}));
				return;
			}
			/**
			 * Global gold multiplier state change.
			 */
			dispatch(
				upgrade({
					cost: employee.cost,
					multiplier: employee.profit,
				})
			);
			/**
			 * Global selected employee updation.
			 */
			dispatch(
				update({
					index,
					quantity: CONSTANTS.EMPLOYEE_INCREASE_VALUE,
				})
			);
			dispatch(
				addMessage({
					type: 'success',
					content: `${employee.name} was been hired!`,
					time: Date.now(),
				})
			);
		}
	};

export const { increment, upgrade } = goldSlice.actions;
export default goldSlice.reducer;
