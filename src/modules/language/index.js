import I18n from 'react-native-i18n';
import * as Model from '../../memory/model'
import vi from './language_json/vi.json';
import en from './language_json/en.json';
import cn from './language_json/cn.json';
// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
I18n.fallbacks = true;

// English language is the main language for fall back:
I18n.translations = { en, vi, cn };
I18n.locale = 'en';
const languageCode = I18n.locale.substr(0, 2);

// All other translations for the app goes to the respective language file:
switch (languageCode) {
	case 'vi':
		I18n.translations.vi = vi;
		break;
	case 'cn':
		I18n.translations.cn = cn;
		break;
	default:
		I18n.translations.en = en;
		break;
}
export default translate = {
	t: (key, option) => {
		const opt = option || { locale: Model.getLang() }
		return key
			? I18n.t(key, opt)
			: ''
	},
	tOri: (key) => {
		return key
			? I18n.t(key)
			: ''
	},
	tEn: (key) => {
		return key
			? I18n.t(key)
			: ''
	}
}
