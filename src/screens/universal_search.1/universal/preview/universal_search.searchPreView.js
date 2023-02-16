import React, { PureComponent } from 'react';
import { Keyboard, View, Animated, Text, Platform, TouchableOpacity, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import { connect } from 'react-redux';
// Component
import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import SearchDetail from '@unis/detail/search_detail.view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchSymbolDetail from '../../detail/symbol/search_symbol_detail';
import PriceDetail from '../../detail/price';
import PriceDetailHeader from '../../detail/price/price_header';
import DepthDetail from '../../detail/depth';
import CosDetail from '../../detail/cos';
import GetAllDataPrice from '@unis/detail/price/getAllComp';
import SearchNew from '../../detail/new/search_new';
import Header from '../../detail/header';
import { iconsMap, iconsLoaded } from '~/utils/AppIcons';
import SearchOrder from '../../detail/order/search_order';
import NetworkWarning from '~/component/network_warning/network_warning.1';
// import SearchPortfolio from './,,.portfolio/search_portfolio';
import SearchPortfolio from '../../detail/portfolio/search_portfolio';
// import SearchPortfolio from '../../detail/portfolio/search_portfolio.clone';
import filterType from '~/constants/filter_type';
import SearchOrderSliding from '../../detail/order/search_order_sliding';
import SlidingPanel from '../../detail/contentSlide';
import I18n from '~/modules/language';
import * as Controller from '~/memory/controller';
import ProgressBar from '~/modules/_global/ProgressBar';
import SearchNewActions from '../../detail/new/search_new.reducer';
import HandleDataComp from '~/screens/watchlist/handle_data';
import * as Emitter from '@lib/vietnam-emitter';

const { height: HEIGHT_DEVICE } = Dimensions.get('window');

export class SearchPreView extends PureComponent {
	constructor(props) {
		super(props);
		this.userId = Controller.getUserId();
		this.show = this.show.bind(this)
		this.renderDragHandler = this.renderDragHandler.bind(this)
		this.renderDragIcon = this.renderDragIcon.bind(this)
		this.renderEmptyView = this.renderEmptyView.bind(this)
		this.renderCloseIcon = this.renderCloseIcon.bind(this)
		this.onClose = this.onClose.bind(this)
		this.openSlide = this.openSlide.bind(this)
		this.onScrollChange = this.onScrollChange.bind(this)
		this.addListenerForChildrenScroll = this.addListenerForChildrenScroll.bind(this)

		this.scrollContainerValue = new Animated.Value(0)
		this.scrollValue = new Animated.Value(0)
		this.state = {
			symbol: '',
			loadHalf: false
		}
		this.addListenerForContainerScroll()
		this.addListenerForChildrenScroll()
	}

	onScrollChange() {
		this.nestedScroll && this.nestedScroll.isExpandBottom();
	}

	addListenerForContainerScroll() {
		this.scrollContainerValue.addListener(({ value }) => {
			const threshold = 88;
			if (value > threshold && this.props.title) {
				this.props.changeTitle && this.props.changeTitle('');
				// this.nestedScroll && this.nestedScroll.snapContainerTopMiddle();
			} else if (value <= threshold && !this.props.title) {
				this.props.changeTitle && this.props.changeTitle('universalSearch');
				// this.nestedScroll && this.nestedScroll.snapContainerTopTop();
			}
		});
	}
	addListenerForChildrenScroll() {
		this.scrollValue.addListener(({ value }) => {
			if (!this.state.loadHalf && value >= 800) {
				this.setState({
					loadHalf: true
				})
			}
		})
	}
	componentDidMount() {
		this.props.setRef && this.props.setRef(this);
		setTimeout(() => {
			if (!this.state.loadHalf) this.setState({ loadHalf: true });
		}, 4000)
	}

	componentWillUnmount() {
		this.props.setRef && this.props.setRef(undefined)
	}
	show({ data }) {
		const { symbol, exchanges } = data
		this.setState({ symbol, exchange: exchanges[0] }, () => {
		});
		this.nestedScroll && this.nestedScroll.snapContainerTopTop()
	}
	openSlide(detail) {
		const { data } = detail;
		// this.props.changeTitle && this.props.changeTitle('orderDetailUpper');
		this.setState({
			data
		}, () => {
			this.SlidingPanel && this.SlidingPanel.handlePressOn && this.SlidingPanel.handlePressOn()
		})
	}

	renderDragIcon() {
		return <View style={[CommonStyle.dragIcons, { marginLeft: -(36 - 8) }]} />
	}
	renderEmptyView() {
		return <View style={CommonStyle.dragIconsVisible} />
	}

	onClose(preventEmit) {
		this.setState({
			symbol: null,
			exchange: null
		}, () => {
			this.props.changeTitle && this.props.changeTitle('');
			this.SlidingPanel && this.SlidingPanel.onClose && this.SlidingPanel.onClose(true);
			if (this.nestedScroll) {
				this.nestedScroll.hideContainer();
			}
			this.props.resetPageSizeNews();
			if (this.props.isReady && !preventEmit) {
				Emitter.emit('change_header_watchlist_unis', false);
			}
		})
	}

	renderCloseIcon = () => {
		return <TouchableOpacity
			onPress={() => this.onClose()}
			style={{
				height: 24,
				paddingTop: 8
			}}
		>
			<View style={CommonStyle.closeIconSlide}>
				<Ionicons
					style={{ lineHeight: 24, fontWeight: 'bold' }}
					name='md-close'
					color={CommonStyle.fontColor}
					size={18}
				/>
			</View>
		</TouchableOpacity>
	}

	renderDragHandler() {
		return <View style={[
			CommonStyle.dragHandlerNewOrder,
			CommonStyle.DragBar
		]}>
			{this.renderEmptyView()}
			{this.renderDragIcon()}
			{this.renderCloseIcon()}
		</View>
	}
	setRightBtnNav = (rightButtons = []) => {
		this.props.navigator && this.props.navigator.setButtons({ rightButtons })
	}
	handleShowPortfolioDetail = ({ data }) => {
		this.portfolioDetails && this.portfolioDetails.show({ data })
		const isStreaming = Controller.isPriceStreaming()
		const rightButtons = isStreaming ? [] : [
			{
				title: 'Refresh',
				id: 'refresh_button',
				icon: iconsMap['ios-refresh-outline']
			}
		]
		this.setRightBtnNav(rightButtons)
	}
	renderFooter() {
		return <View onLayout={this.onlayoutFooter}>
			<Header title={I18n.t('openOrders')} />
			<Header title={I18n.t('stopLossOrder')} />
			<Header title={I18n.t('filledOrders')} />
			<Header title={I18n.t('cancelledOrders')} />
			<Header title={I18n.t('portfolio')} />
			<SearchPortfolio
				handleShowPortfolioDetail={this.handleShowPortfolioDetail}
				onScrollChange={this.onScrollChange}
				navigator={this.props.navigator}
			/>
		</View>
	}
	renderHeader() {
		const { symbol, exchange, data } = this.state
		const { navigator, isReady } = this.props
		return <View onLayout={this.onlayoutHeader}>
			<PriceDetail
				navigator={navigator}
				symbol={symbol}
				exchange={exchange} />
			<DepthDetail symbol={symbol} navigator={navigator} />
			<CosDetail symbol={symbol} navigator={navigator} />
			<Header title={I18n.t('News')} />
			<SearchNew
				navigator={this.props.navigator}
				scrollDisalbe
			/>
		</View>
	}
	onlayoutHeader(event) {
		const { height: h } = event.nativeEvent.layout;
		this.heightHeader = h
	}
	onlayoutFooter(event) {
		const { height: h } = event.nativeEvent.layout;
		this.heightFooter = h
	}
	render() {
		const { symbol, exchange, data } = this.state
		const { navigator, isReady, isConnected } = this.props
		// if (!symbol) {
		// 	return null;
		// }
		let marginTop = 0
		if (!isConnected && this.props.isWatchList) {
			marginTop += 24
		}
		return (
			<React.Fragment>
				<NestedScrollView
					scrollContainerValue={this.scrollContainerValue}
					scrollValue={this.scrollValue}
					ref={sef => (this.nestedScroll = sef)}
					style={{
						flex: 1,
						...this.props.style,
						marginTop
					}}
				>
					<ScrollLoadAbs
						style={{ backgroundColor: CommonStyle.backgroundColor, minHeight: HEIGHT_DEVICE - 64 }}
						scrollValue={this.scrollValue}>
						<View
							isAbsolute
							style={{ backgroundColor: CommonStyle.backgroundColor }}>
							{this.renderDragHandler()}
							{symbol && exchange ? <GetAllDataPrice symbol={symbol} navigator={navigator} /> : null}
							{symbol && exchange ? <SearchSymbolDetail symbol={symbol} /> : null}
							{
								symbol && exchange ? <PriceDetailHeader
									isReady={this.props.isReady}
									subNews={true}
									navigator={navigator}
									symbol={symbol}
									exchange={exchange}
									onAuth={this.props.onAuth} /> : null
							}
						</View>
						{
							!(symbol && exchange) ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColor }}>
								<ProgressBar />
							</View>
								: <View style={{ backgroundColor: CommonStyle.backgroundColor, flex: 1 }}>
									{this.renderHeader()}
									{this.state.loadHalf ? this.renderFooter() : <View style={{ flex: 1, height: 800, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColor }}>
										<ProgressBar />
									</View>}
								</View>
						}
						{/* <View style={{ height: 28 }} /> */}
					</ScrollLoadAbs>
				</NestedScrollView>
				{/* <PortfolioDetail
					// setTitle={this.setTitle}
					navigator={this.props.navigator}
					setRightButton={this.setRightBtnNav}
					onRef={ref => this.portfolioDetails = ref} /> */}
				<SlidingPanel
					title={this.props.title}
					changeTitle={this.props.changeTitle}
					setRef={ref => this.SlidingPanel = ref}
					navigator={this.props.navigator}
					data={data}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	return {
		isConnected: state.app.isConnected
	}
}

function mapDispatchToProps(dispatch) {
	return {
		resetPageSizeNews: (...p) =>
			dispatch(SearchNewActions.resetPageSizeNews(...p))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreView);
