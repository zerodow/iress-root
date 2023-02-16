import Enum from '~/enum';
import { func, dataStorage } from '~/storage';
const { LOGIN_TYPE, ENV_TYPE, REGION_ACCESS } = Enum;
const TABS = [
	{
		label: 'oktaLogin',
		key: 'okta'
	},
	{
		label: 'userLogin',
		key: 'email'
	}
];
let model = {
	loginType: LOGIN_TYPE.DEFAULT,
	env: ENV_TYPE.UAT,
	region: {},
	isLogin: false
};
export function setBrokerName(brokerName) {
	func.setBrokerName(brokerName);
	model.brokerName = brokerName;
}
export function getBrokerName() {
	return model.brokerName;
}
export function setRegionSelected(region) {
	func.setRegionSelected(region);
	model.region = region;
}
export function getRegionSelected() {
	return model.region || {};
}
export function getNewEnv() {
	const currentEnv = model.env;
	if (currentEnv === ENV_TYPE.UAT) {
		return ENV_TYPE.DEV;
	}
	return ENV_TYPE.UAT;
}
export function setEnv(env) {
	model.env = env;
}
export function getEnv() {
	return model.env;
}
export function setLoginType(loginType) {
	model.loginType = loginType;
}
export function getLoginType() {
	return model.loginType;
}
export function getListLoginType() {
	const { region_access: regionAccess = [] } = model.region;
	const listLoginType = TABS.map((el) => {
		const isDisabled =
			regionAccess.findIndex(
				(tmp) =>
					(tmp + '').toLocaleLowerCase() ===
					(el.key + '').toLocaleLowerCase()
			) === -1;
		return {
			...el,
			isDisabled: false
		};
	});
	return listLoginType || [];
}
export function detroy() {
	model = {
		loginType: LOGIN_TYPE.DEFAULT,
		env: ENV_TYPE.UAT,
		region: {}
	};
}
export function setCacheLoginSuccess(isLogin) {
	func.setCacheLoginSuccess(isLogin);
	model.isLogin = isLogin;
}
export function getCacheLoginSuccess() {
	return model.isLogin;
}
