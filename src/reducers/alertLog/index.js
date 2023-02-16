import { mapValues } from 'lodash';
import Enum from '~/enum'
import * as effects from './effects';
import * as reducers from './reducers';
global.tmpDepthsData = {};

export default {
  state: {
    data: {},
    listNotification: {},
    alertType: {
      label: 'Last Price',
      key: 'LAST_PRICE'
    },
    trigger: {
      label: 'AT',
      key: 'AT'
    },
    targetValue: 0,
    error: null,
    isLoading: true,
    reload: false,
    alertTag: Enum.ALERT_TAG.ALERT,
    animationType: Enum.ANIMATION_TYPE.FADE_IN,
    loading: false,
    deleteExcuted: false
  }, // initial state
  reducers,
  effects: (dispatch) =>
    mapValues(effects, (item) => item.bind(this, dispatch))
};
