import initialState from '../../reducers/initialState';

export const picker = (state = initialState.picker, action) => {
  switch (action.type) {
    case 'PICKER_CHANGED_STATE':
      return {
        ...state,
        name: action.name
      }
    default:
      return state;
  }
}
