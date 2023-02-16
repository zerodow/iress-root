import React, { PureComponent } from 'react';
import _ from 'lodash';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Enum from '../../enum';
import I18n from '../../modules/language';
import SVActions from '../../component/scrollCustom/scrollview.reducer';
import styles from './style/market_depth';
import { formatNumber, formatNumberNew2 } from '../../lib/base/functionUtil';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
const ROW_KEY = 'MARKET_DEPTH';

class RowComp extends React.Component {
	constructor(props) {
		super(props);
		this.id = ROW_KEY + props.index;
		this.props.addSVChild(this.id, () => this);
	}

	shouldComponentUpdate({ isShouldRender }) {
		return isShouldRender || _.isUndefined(isShouldRender);
	}

	componentWillUnmount = () => {
		this.props.rmSVChild(this.id);
	};

	getText(text) {
		return I18n.t(text);
	}

	renderLeftContent() {
		const {
			bid_percent: bidPercent,
			bid_no: bidNo,
			bid_quantity: bidQuantity,
			bid
		} = this.props.data || {};
		return (
			<View style={CommonStyle.headerLeft}>
				<View
					style={{
						position: 'absolute',
						width: `${bidPercent * 100}%`,
						backgroundColor: '#00b80030',
						height: '100%',
						marginTop: 1,
						borderRightWidth: 1,
						borderColor: CommonStyle.backgroundColor,
						borderBottomLeftRadius: 2,
						borderTopLeftRadius: 2
					}}
				/>
				<Text
					style={[
						CommonStyle.textSubNormalBlack,
						styles.col3,
						{ textAlign: 'left', marginTop: 7 }
					]}
				>
					{bidNo}
				</Text>
				<Text
					style={[
						CommonStyle.textSubNormalBlack,
						styles.col1,
						{ textAlign: 'right', marginTop: 7 }
					]}
				>
					{bidQuantity ? formatNumber(bidQuantity) : ''}
				</Text>
				<Text
					style={[
						CommonStyle.textMainNormalNoColor,
						styles.col2,
						{
							paddingRight: 12,
							textAlign: 'right',
							marginVertical: 6,
							color: '#00b800',
							opacity: CommonStyle.opacity1
						}
					]}
				>
					{bid ? formatNumberNew2(bid, PRICE_DECIMAL.PRICE) : ''}
				</Text>
			</View>
		);
	}

	renderRightContent() {
		const {
			ask,
			ask_quantity: askQuantity,
			ask_no: askNo,
			ask_percent: askPercent
		} = this.props.data || {};
		return (
			<View style={CommonStyle.headerRight}>
				<View
					style={{
						position: 'absolute',
						width: `${askPercent * 100}%`,
						backgroundColor: '#df000030',
						height: '100%',
						marginTop: 1,
						borderBottomRightRadius: 2,
						borderTopRightRadius: 2
					}}
				/>
				<Text
					style={[
						CommonStyle.textMainNormalNoColor,
						styles.col2,
						{
							paddingLeft: 12,
							marginVertical: 6,
							color: '#df0000',
							opacity: CommonStyle.opacity1
						}
					]}
				>
					{ask ? formatNumberNew2(ask, PRICE_DECIMAL.PRICE) : ''}
				</Text>
				<Text
					style={[
						CommonStyle.textSubNormalBlack,
						styles.col1,
						{ marginTop: 7 }
					]}
				>
					{askQuantity ? formatNumber(askQuantity) : ''}
				</Text>
				<Text
					style={[
						CommonStyle.textSubNormalBlack,
						styles.col3,
						{ textAlign: 'right', marginTop: 7 }
					]}
				>
					{askNo}
				</Text>
			</View>
		);
	}

	render() {
		const { index } = this.props;

		return (
			<View
				key={index}
				style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}
			>
				<View style={[styles.header, { borderBottomColor: CommonStyle.backgroundColor }]}>
					{this.renderLeftContent()}
					{this.renderRightContent()}
				</View>
			</View>
		);
	}
}

export default connect(
	(state, ownProps) => ({
		isShouldRender: state.scrollView.childStatus[ROW_KEY + ownProps.index]
	}),
	dispatch => ({
		addSVChild: (...p) =>
			dispatch(SVActions.SvMeasureAddChildToStack(...p)),
		rmSVChild: (...p) =>
			dispatch(SVActions.SvMeasureRemoveChildToStack(...p))
	})
)(RowComp);
