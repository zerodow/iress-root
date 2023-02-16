
import initialState from '../../../reducers/initialState';
export const tab = (state = initialState.tab, action) => {
    // console.log('state: ', state);
    switch (action.type) {
        case 'SWITCH_TAB':
            return {
                ...state,
                currentTab: action.screen
            };
        default:
            return state
    }
}
