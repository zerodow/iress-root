
export function changStatePicker(name) {
  return dispatch => {
    dispatch(changStateHandler());
  };
}

export function changStateHandler(name) {
  return {
    type: 'PICKER_CHANGED_STATE',
    name
  }
}
