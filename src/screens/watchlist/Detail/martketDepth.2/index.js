import React, { PureComponent, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import { func } from '~/storage';
import I18n from '~/modules/language';
import FlatList from '../../Animator/FLatListAni';
import Header from './header';
import Row from './row';
import TouchableOpacityOpt from '@component/touchableOpacityOpt';
import Animated, { Easing } from 'react-native-reanimated';
import ENUM from '~/enum';
import {
	setActiveScreen,
	setInactiveScreen
} from '~/manage/manageActiveScreen';
import ProgressBar from '~/modules/_global/ProgressBar';
import ErrorStatus from '../ErrorStatus';

const { ACTIVE_STREAMING } = ENUM;
const { block, call, cond, eq, and, set } = Animated;

export const MoreButton = (props) => (
	<TouchableOpacityOpt onPress={props.onPress} style={[]}>
		<Text
			style={{
				fontSize: CommonStyle.fontSizeS,
				color: CommonStyle.fontBlue
			}}
		>
			{I18n.t('more')}
		</Text>
	</TouchableOpacityOpt>
);

const RenderEmptyData = ({ isLoadingDepth }) => {
	if (isLoadingDepth) {
		return <ProgressBar color={CommonStyle.fontWhite} />
	}

	return (
		<Text
			style={{
				color: CommonStyle.fontColor,
				fontFamily: CommonStyle.fontPoppinsRegular
			}}
		>
			{I18n.t('noData')}
		</Text>
	);
};

class MarketDepths extends PureComponent {
	constructor(props) {
		super(props);
		this.quantity = 10;
		this.maxLength = 10;

		let { actived = 0, tabIndex } = props;
		if (tabIndex === undefined || tabIndex === null) {
			tabIndex = 1;
		}

		this.canRunAni = new Animated.Value(1);

		this.listenerActivedChange = block([
			cond(
				eq(actived, tabIndex),
				cond(this.canRunAni, [
					call([], () => this._list && this._list.start()),
					set(this.canRunAni, 0)
				]),
				[
					call([], () => this._list && this._list.hide()),
					set(this.canRunAni, 1)
				]
			)
		]);
	}
	// componentDidMount() {
	//     console.info('DEPTH DIDMOUNT')
	//     setActiveScreen(ACTIVE_STREAMING.DEPTH)
	// };

	// componentWillUnmount() {
	//     console.info('DEPTH UNMOUNT')
	//     setInactiveScreen(ACTIVE_STREAMING.DEPTH)
	// }

	componentWillReceiveProps(nextProps) {
		if (
			this.props.symbol !== nextProps.symbol ||
			this.props.exchange !== nextProps.exchange
		) {
			this.canRunAni.setValue(1);
		}
	}

	getData(depth) {
		if (_.isEmpty(depth)) return [];

		const { bid: Bid, ask: Ask } = depth || {};

		const { quantity: maxAsk = 1 } =
			_.maxBy(_.values(Ask), (o) => o.quantity) || {};
		const { quantity: maxBid = 1 } =
			_.maxBy(_.values(Bid), (o) => o.quantity) || {};

		const max = Math.max(maxBid, maxAsk);
		this.updateMaxLength(Math.max(_.size(Ask), _.size(Bid)));
		const quantity =
			this.maxLength < this.quantity ? this.maxLength : this.quantity;

		const listData = [];
		for (let index = 0; index < quantity; index++) {
			const elementAsk = Ask[index] || {};
			const elementBid = Bid[index] || {};

			listData.push({
				ask: {
					price: elementAsk.price,
					quantity: elementAsk.quantity,
					percent: elementAsk.quantity / max,
					no: elementAsk.number_of_trades
				},
				bid: {
					price: elementBid.price,
					quantity: elementBid.quantity,
					percent: elementBid.quantity / max,
					no: elementBid.number_of_trades
				}
			});
		}

		return listData;
	}

	renderEmpty(isEmpty) {
		// if (!isEmpty) return <View />
		return (
			<View
				onLayout={this.props.onLayout}
				style={{
					paddingHorizontal: 16,
					height: 205,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: CommonStyle.backgroundColor1
				}}
			>
				{<RenderEmptyData isLoadingDepth={this.props.isLoadingDepth} />}
			</View>
		);
	}

	updateMaxLength = this.updateMaxLength.bind(this);
	updateMaxLength(maxLength) {
		this.maxLength = maxLength;
	}

	loadMore = this.loadMore.bind(this);
	loadMore() {
		const newQuantity = this.quantity + 10;
		if (newQuantity > this.maxLength) {
			this.quantity += this.maxLength - this.quantity;
		} else {
			this.quantity += 10;
		}
		this.forceUpdate();
	}

	renderHeader = this.renderHeader.bind(this);
	renderHeader() {
		return <Header />;
	}

	renderFooter = this.renderFooter.bind(this);
	renderFooter() {
		return <Animated.Code exec={this.listenerActivedChange} />;
	}

	setRef = this.setRef.bind(this);
	setRef(sef) {
		this._list = sef;
	}

	renderItem = this.renderItem.bind(this);
	renderItem({ item, index }) {
		return <Row item={item} index={index} />;
	}

	renderMore = this.renderMore.bind(this);
	renderMore() {
		if (this.quantity >= this.maxLength) return null;
		return <MoreButton onPress={this.loadMore} />;
	}

	render() {
		const data = this.getData(this.props.depth);

		// const status = 1;

		if (this.props.status) {
			return (
				<View
					style={{
						paddingHorizontal: 16,
						width: '100%',
						height: 211 + 20 + 25,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<ErrorStatus
						status={this.props.status}
						title={I18n.t('depth')}
					/>
				</View>
			);
		}

		if (_.isEmpty(data)) {
			return this.renderEmpty();
		}
		return (
			<React.Fragment>
				<FlatList
					ref={this.setRef}
					passPropsToChild
					numberListDelay={1}
					scrollEnabled={false}
					contentContainerStyle={{ paddingHorizontal: 8 }}
					withoutDidmount
					onLayout={this.props.onLayout}
					data={data}
					renderItem={this.renderItem}
					ItemSeparatorComponent={() => (
						<View style={{ height: 1 }} />
					)}
					ListHeaderComponent={this.renderHeader}
					ListFooterComponent={this.renderFooter}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state, { symbol, exchange }) => ({
	depth: state.depths.data[symbol + '#' + exchange],
	isLoadingDepth: state.depths.isLoadingDepth
});

export default connect(mapStateToProps)(MarketDepths);
