
import initialState from '../../reducers/initialState';
export const user = (state = initialState.user, action) => {
  // console.log('state: ', state);
  switch (action.type) {
    case 'UPDATE_USER_REQUEST':
      return {
        ...state,
        isLoading: true
      };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        isLoading: false
      }
    case 'UPDATE_USER_ERROR':
      return {
        ...state,
        isLoading: false
      }
    case 'USER_CHANGED_FIELD':
      const newUserInfo = { ...state.userInfo };
      newUserInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        isLoading: false,
        userInfo: newUserInfo
      }
    case 'USER_LOAD_FORM_RESPONSE':
      return {
        ...state,
        isLoading: false,
        userInfo: action.payload
      };
    case 'USER_LOAD_FORM_REQUEST':
      return {
        ...state,
        isLoading: true
      };
    default:
      return state
  }
}
