import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import styles from '~s/trade/style/trade';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/';
import Enum from '~/enum';
import {
	formatNumber,
	formatNumberNew2,
	largeValue,
	checkWeekend
} from '~/lib/base/functionUtil';
import SVActions from '~/component/scrollCustom/scrollview.reducer';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

class InfoComp extends React.Component {
	constructor(props) {
		super(props);
		this.props.addSVChild(this.props.tag, () => this);
	}

	shouldComponentUpdate({ isShouldRender }) {
		return isShouldRender || _.isUndefined(isShouldRender);
	}

	componentWillUnmount = () => {
		this.props.rmSVChild(this.props.tag);
	};

	render() {
		const { tagStyles, valueStyles, tag, value } = this.props;
		return (
			<React.Fragment>
				<Text style={[CommonStyle.textSub, tagStyles]}>{tag}</Text>
				<Text style={[CommonStyle.textSubBold1, valueStyles]}>
					{value}
				</Text>
			</React.Fragment>
		);
	}
}

const Info = connect(
	(state, ownProps) => ({
		isShouldRender: state.scrollView.childStatus[ownProps.tag]
	}),
	dispatch => ({
		addSVChild: (...p) =>
			dispatch(SVActions.SvMeasureAddChildToStack(...p)),
		rmSVChild: (...p) =>
			dispatch(SVActions.SvMeasureRemoveChildToStack(...p))
	})
)(InfoComp);

class TradeInfo extends PureComponent {
	getText(text) {
		const { language } = this.props;
		return I18n.t(text, { locale: language });
	}

	showValue(isLoading, value, isFormat = true) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return isFormat
				? formatNumberNew2(value, PRICE_DECIMAL.PRICE)
				: value;
		}
	}

	showPriceClose(closePrice) {
		const isWeekend = checkWeekend();
		if (!isWeekend) {
			return closePrice < 0 ||
				closePrice === null ||
				closePrice === undefined
				? '--'
				: formatNumberNew2(closePrice, PRICE_DECIMAL.PRICE);
		}
		return closePrice < 0 || closePrice === null || closePrice === undefined
			? '--'
			: formatNumberNew2(closePrice, PRICE_DECIMAL.PRICE);
	}

	render() {
		const { isLoading, priceObject = {} } = this.props;
		const {
			open,
			previous_close: preClose,
			high,
			close,
			low,
			volume
		} = priceObject;

		const openValue = this.showValue(isLoading, open);
		const preCloseValue = this.showValue(isLoading, preClose);
		const highValue = this.showValue(isLoading, high);
		const closeValue = isLoading ? '--' : this.showPriceClose(close);
		const lowValue = this.showValue(isLoading, low);
		let volumeValue = '--';
		if (!isLoading) {
			volumeValue = formatNumber(volume <= 0 ? '--' : largeValue(volume));
		}
		return (
			<View style={styles.rowExpand}>
				<View style={styles.expandLine}>
					<Info
						tag={this.getText('openSearch')}
						value={openValue}
						tagStyles={{ width: '20%' }}
						valueStyles={{ width: '28%' }}
					/>
					<Text style={{ width: '4%' }} />
					<Info
						tag={this.getText('previousClose')}
						value={preCloseValue}
						tagStyles={{ width: '27%' }}
						valueStyles={{ width: '21%', textAlign: 'right' }}
					/>
				</View>
				<View style={styles.expandLine}>
					<Info
						tag={this.getText('high')}
						value={highValue}
						tagStyles={{ width: '20%' }}
						valueStyles={{ width: '28%' }}
					/>
					<Text style={{ width: '4%' }} />
					<Info
						tag={this.getText('close')}
						value={closeValue}
						tagStyles={{ width: '27%' }}
						valueStyles={{ width: '21%', textAlign: 'right' }}
					/>
				</View>
				<View style={styles.expandLine}>
					<Info
						tag={this.getText('low')}
						value={lowValue}
						tagStyles={{ width: '20%' }}
						valueStyles={{ width: '28%' }}
					/>
					<Text style={{ width: '4%' }} />
					<Info
						tag={this.getText('todayVolume')}
						value={volumeValue}
						tagStyles={{ width: '27%' }}
						valueStyles={{ width: '21%', textAlign: 'right' }}
					/>
				</View>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	priceObject: state.price.priceObject,
	symbol: state.searchDetail.symbol,
	language: state.setting.lang,
	isLoading: state.price.isLoading
});

export default connect(mapStateToProps)(TradeInfo);
