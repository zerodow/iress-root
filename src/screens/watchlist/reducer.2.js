export default {
	state: {
		resetListContent: () => null,
		rowId: -1,
		resetRowActions: () => null,
		timmer: false
	}, // initial state
	reducers: {
		// handle state changes with pure functions
		setResetListContent: (state, { func }) => {
			state.resetListContent = func;
			return state;
		},
		setRowActions: (state, { func = () => null, id }) => {
			try {
				id !== state.rowId && state.resetRowActions();
			} catch (error) {}
			state.resetRowActions = func;
			state.rowId = id;
		},
		resetActions: (state) => {
			try {
				state.resetRowActions();
			} catch (error) {}
			state.resetRowActions = () => null;
			state.rowId = -1;
		},
		resetContent: (state) => {
			state.timmer = true;
		},
		resetContent2: (state) => {
			state.resetListContent();
			state.timmer = false;
		}
	}
};
