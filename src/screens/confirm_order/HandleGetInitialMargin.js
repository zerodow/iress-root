import * as Business from '~/business';
import * as Controller from '~/memory/controller';
import { changeLoadingInitialMargin } from '~/screens/confirm_order/Redux/actions.js';
import { useLayoutEffect } from 'react';

const model = {
	balance: null,
	fees: null,
	initialMargin: null,
	dataVolume: null
};

export const setInitialMarginPercent = () => {
	if (model.balance && model.fees) {
		model.initialMargin = Business.getInitialMargin({
			fees: model.fees,
			balance: model.balance,
			dataVolume: model.dataVolume
		});

		if (model.fees?.account_id === model.balance?.account_id) {
			Controller.dispatch(changeLoadingInitialMargin(false));
		}
	}
};
export function getInitialMargin() {
	return model.initialMargin;
}

export function setBalance(balance) {
	model.balance = balance;
	setInitialMarginPercent();
}
export function setFees(fees, accountId, dataVolume) {
	model.fees = { ...fees, account_id: accountId };
	model.dataVolume = dataVolume;
	setInitialMarginPercent();
}
export function reset() {
	model.balance = null;
	model.fees = null;
	model.initialMargin = null;
}
export function HandleGetInitialMarginComp() {
	useLayoutEffect(() => {
		Controller.dispatch(changeLoadingInitialMargin(true));
	}, []);
	return null;
}
