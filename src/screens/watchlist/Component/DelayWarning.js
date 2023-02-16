import React, { PureComponent } from 'react';

import { func } from '~/storage';
import UserType from '~/constants/user_type';

import Warning from '~/component/warning/warning.1';
import I18n from '~/modules/language';

export default class DelayWarning extends PureComponent {
	render() {
		if (func.getUserPriceSource() !== UserType.Delay) return null;
		return <Warning warningText={I18n.t('delayWarning')} isConnected />;
	}
}
