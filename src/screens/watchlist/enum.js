import { Dimensions, Platform } from 'react-native';

import * as FunctionUtil from '~/lib/base/functionUtil';

const { width, height } = Dimensions.get('window');

const isIphone = Platform.OS === 'ios';
const isIphoneXorAbove = FunctionUtil.isIphoneXorAbove();
let marginTop = 0;
if (isIphone && isIphoneXorAbove) marginTop = 16 + 16;
if (isIphone && !isIphoneXorAbove) marginTop = 16;

export const STATUS_BAR_HEIGHT = marginTop;

export const DEVICE_WIDTH = width;
export const DEVICE_HEIGHT = height;
export const HEIGHT_FOOTER = DEVICE_HEIGHT / 4;
export const BOTTOM_TABBAR_HEIGHT = 88;
export const HEIGHT_SEPERATOR = 8;
export const HEIGHT_ROW = 64;
export const HEIGHT_ROW_MARKET_INFO = 84;
export const HEIGHT_ROW_HEADER = 73;
export const WIDTH_ROW_HEADER = 126;
export const TRADELIST_PADDING = 12;
export const PADDING_BOTTOM = 8;
export const NUMBER_LOOP = 5;
export const NUMBER_LIST = 13;

export const STATE = {
	ON_START: 1,
	ON_END: 2,
	ON_MOMENTUM: 10,
	ON_MOMENTUM_END: 11
};

export const NESTED_STATE = {
	UNDETERMINED: 0,
	SHOW: 1,
	HIDE: 2,
	SNAP_TOP: 3
};

export const INVALID = {
	INVALID_CODE_EXCHANGES: 1,
	INVALID_CODE: 2,
	INVALID_EXCHANGES: 3,
	INVALID_WATCHLIST: 4,
	INVALID_ACCESS: 5
};
