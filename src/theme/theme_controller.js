import Light from './color_define/light';
import Dark from './color_define/dark';
import Theme1 from './color_define/theme_1';
import * as PureFunc from '../utils/pure_func';
import Enum from '../enum';
import * as Channel from '../streaming/channel';
import * as Controller from '../memory/controller';
import * as Emitter from '@lib/vietnam-emitter';

const THEME = Enum.THEME;
export const FIXED_THEME = THEME.DARK; // THEME.DARK;

const getTheme = (theme) => {
	switch (theme) {
		case THEME.THEME1:
			return Theme1();

		case THEME.LIGHT:
			return Light();

		case THEME.DARK:
		default:
			return Dark();
	}
};

// Controller.setThemeColor(Enum.THEME.LIGHT)
const Style = PureFunc.clone(getTheme(FIXED_THEME));
const ListRegister = [];

export function changeTheme(color = THEME.LIGHT) {
	Controller.setThemeColor(color);

	if (FIXED_THEME) color = FIXED_THEME; // Fake default theme

	PureFunc.assignKeepRef(Style, PureFunc.clone(getTheme(color)));

	ListRegister.map((func) => func());

	Emitter.emit(Channel.getChannelChangeTheme());
}
export function register(func) {
	ListRegister.push(func);
}

export default Style;
