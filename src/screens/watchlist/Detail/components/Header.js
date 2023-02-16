import React, { Component } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import SymbolName from './SymbolName';
import BuySellButton from './BuySellButton';
import SymbolInfo from './SymbolInfo';
import NewAlertButton from './NewAlertButton';
import LastTradeInfo, { MiniLastTradeInfo } from './LastTradeInfo';
import ShowHideComp from './ShowHideAni';

const { lessThan, greaterThan, greaterOrEq, Value, multiply } = Animated;

const { height: devicesHeight } = Dimensions.get('window');

class HeaderDetail extends Component {
	constructor(props) {
		super(props);
		this.heightDefault = new Value(0);
	}

	onDefaultLayout = this.onDefaultLayout.bind(this);
	onDefaultLayout(e) {
		this.heightDefault.setValue(e.nativeEvent.layout.height);
	}

	renderMiniHeader() {
		const { isLoading, symbol, exchange, onAuth } = this.props;
		return (
			<React.Fragment>
				<View style={[styles.miniContent, { paddingBottom: 16 }]}>
					<SymbolName symbol={symbol} />
					<MiniLastTradeInfo symbol={symbol} exchange={exchange} />
				</View>
				<BuySellButton
					isLoading={isLoading}
					symbol={symbol}
					exchange={exchange}
					onAuth={onAuth}
				/>
			</React.Fragment>
		);
	}

	renderDefaultHeader() {
		const {
			isLoading,
			symbol,
			exchange,
			onAuth,
			onRefresh,
			navigator
		} = this.props;
		return (
			<React.Fragment>
				<SymbolInfo
					symbol={symbol}
					navigator={navigator}
					onRefresh={onRefresh}
				/>

				<View
					style={{
						flexDirection: 'row',
						marginTop: 8,
						marginBottom: 16
					}}
				>
					<NewAlertButton
						exchange={exchange}
						navigator={navigator}
						symbol={symbol}
					/>
					<LastTradeInfo symbol={symbol} exchange={exchange} />
				</View>
				<BuySellButton
					isLoading={isLoading}
					symbol={symbol}
					exchange={exchange}
					onAuth={onAuth}
				/>
			</React.Fragment>
		);
	}

	render() {
		const { _scrollValue: scrollProps, _changePoint } = this.props;

		const _scrollValue = multiply(scrollProps, -1);
		return (
			<Animated.View
				pointerEvents="box-none"
				onLayout={this.onDefaultLayout}
				style={{
					transform: [{ translateY: _scrollValue }],
					zIndex: 99
				}}
			>
				<View pointerEvents="box-none">
					<View style={[styles.defautHeader, styles.miniHeader]}>
						{this.renderMiniHeader()}
					</View>
					<ShowHideComp
						style={styles.defautHeader}
						isShow={greaterOrEq(scrollProps, _changePoint)}
						isHide={lessThan(scrollProps, _changePoint)}
						withTrans={devicesHeight}
					>
						{this.renderDefaultHeader()}
					</ShowHideComp>
				</View>
			</Animated.View>
		);
	}
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	defautHeader: {
		paddingHorizontal: CommonStyle.paddingSize,
		paddingTop: 4,
		paddingBottom: 8,
		backgroundColor: CommonStyle.backgroundColor,
		width: '100%'
		// borderBottomWidth: 1,
		// borderBottomColor: 'rgba(255, 255, 255, 0.2)'
	},
	miniHeader: {
		position: 'absolute',
		paddingTop: 4,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.2)'
	},
	miniContent: {
		flexDirection: 'row',
		paddingBottom: 8,
		alignItems: 'center'
	}
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

const mapStateToProps = (state) => ({
	isLoading: state.watchlist3.detailLoading
});

export default connect(mapStateToProps)(HeaderDetail);
