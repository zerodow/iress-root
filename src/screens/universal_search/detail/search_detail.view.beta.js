// Default import
import React, { Component } from 'react';
import _ from 'lodash';
import { Text, PixelRatio, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux'
// Func
import I18n from '~/modules/language';
import filterType from '~/constants/filter_type';
import CommonStyle, { register } from '~/theme/theme_controller'
import { formatNumberNew2 } from '../../../lib/base/functionUtil';
import Enum from '../../../enum'
// Comp
import Header from './search_header';
// import SearchNew from './new/search_new';
import SearchNew from './new/search_new_beta';
import SearchOrderSliding from './order/search_order_sliding';
import SearchPortfolio from './portfolio/search_portfolio';
import ScrollView from '~/component/scrollCustom';
import SlidingPanel from './contentSlide';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
class SearchDetail extends Component {
	constructor(props) {
		super(props);
				this.checkAuth = () => null;
		this.onOrder = () => null;
		this.scrollValue = new Animated.Value(0)
		this.scrollContainerValue = new Animated.Value(0);
		this.openSlide = this.openSlide.bind(this)
		this.state = {
			data: {}
		}
	}
	checkIndication(indicativePrice) {
		if (this.props.isLoading === true) return '--'
		return (
			indicativePrice === null || indicativePrice === undefined ? '--' : formatNumberNew2(indicativePrice, PRICE_DECIMAL.PRICE)
		)
	}
	checkSurplus(surplusVolume) {
		if (this.props.isLoading === true) return '--'
		return surplusVolume === null || surplusVolume === undefined
			? '--'
			: ` ${this.props.side && this.props.side.toUpperCase() === 'S' ? '-' : ''}${surplusVolume}`
	}
	renderAuctionHeader = () => {
		const { indicativePrice, surplusVolume } = this.props
		if ((surplusVolume === null && indicativePrice === null) || (surplusVolume === undefined && indicativePrice === undefined)) return <View />
		return <View style={CommonStyle.styleViewAuction}>
			<Text style={CommonStyle.textAuctionHeader}>{I18n.t('Indicative_Price')}{this.checkIndication(indicativePrice)}</Text>
			<Text style={CommonStyle.textAuctionHeader}>{I18n.t('Surplus_Volume')}{this.checkSurplus(surplusVolume)}</Text>
		</View>
	}

	openSlide(data) {
		this.setState({
			data
		}, () => {
			this.SlidingPanel && this.SlidingPanel.handlePressOn && this.SlidingPanel.handlePressOn()
		})
	}
	componentWillReceiveProps(props) {
		// console.log('this.is a SYMBOLLLLLLL ==============================> ', props.symbol)
		// if (props.symbol && props.symbol !== this.state.symbol) {
		// 	this.setState({
		// 		symbol: props.symbol
		// 	})
		// }
	}
	renderScrollView = () => {
		const {
			scrollProps,
			navigator
		} = this.props;
		// console.log('this.is a SYMBOLLLLLLL ==============================> ', this.state.symbol)
		return <View style={{ flex: 1 }}>
			<ScrollView {...scrollProps} navigator={navigator}>
				<Header title={I18n.t('News')} />
				<SearchNew
					navigator={this.props.navigator}
				// symbol={this.state.symbol || ''}
				/>

				<Header
					title={I18n.t('openOrders')}
				/>
				<SearchOrderSliding
					filterType={filterType.WORKING}
					navigator={this.props.navigator}
					openSlider={this.openSlide}
				/>

				<Header
					title={I18n.t('stopLossOrder')}
				/>
				<SearchOrderSliding
					filterType={filterType.STOPLOSS}
					navigator={this.props.navigator}
					openSlider={this.openSlide}
				/>
				<Header
					title={I18n.t('filledOrders')}
				/>
				<SearchOrderSliding
					filterType={filterType.FILLED}
					navigator={this.props.navigator}
					openSlider={this.openSlide}
				/>

				<Header
					title={I18n.t('cancelledOrders')}
				/>
				<SearchOrderSliding
					filterType={filterType.CANCELLED}
					navigator={this.props.navigator}
					openSlider={this.openSlide}
				/>

				<Header title={I18n.t('portfolio')} />
				<SearchPortfolio navigator={this.props.navigator} />
			</ScrollView>
		</View>
	}
	openSlider = () => {
		this.SlidingPanel && this.SlidingPanel.handlePressOn && this.SlidingPanel.handlePressOn()
	}
	render() {
		return (
			<View
				style={{
					flex: 1, marginTop: 0, backgroundColor: CommonStyle.colorBgNewAlert
				}}>
				<View style={{ flex: 1 }}>
					{this.renderScrollView()}
					<SlidingPanel
						setRef={ref => this.SlidingPanel = ref}
						navigator={this.props.navigator}
						data={this.state.data}
					/>
				</View>
			</View>
		);
	}
}
const mapStateToProps = state => ({
	indicativePrice: state.marketDepth.indicativePrice,
	surplusVolume: state.marketDepth.surplusVolume,
	side: state.marketDepth.side,
	isLoading: state.marketDepth.isLoading
});

const mapDispatchToProps = dispatch => ({
	setTypeForm: (...p) => dispatch(marketActions.setTypeForm(...p)),
	subMarketDepth: (...p) => dispatch(marketActions.subMarketDepth(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchDetail);
