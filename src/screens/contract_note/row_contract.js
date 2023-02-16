import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio, Dimensions, Platform } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { checkTradingHalt, logDevice, getSymbolInfoApi, getCnoteTimeAgo } from '../../lib/base/functionUtil'
import I18n from '../../modules/language/';
import * as fbemit from '../../emitter';
import * as Business from '../../business';
import Flag from '../../component/flags/flag';
import { dataStorage } from '../../storage'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'

export default class RowContract extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tradingHalt: false,
			data: this.props.data || [],
			isDisabled: false,
			unread: this.props.unread || false
		};
		this.isMount = false;
		this.updateHalt = this.updateHalt.bind(this)
	}

	updateData() {
		const newsId = this.state.data.news_id;
		fbemit.addListener('news_detail', `${newsId}`, () => {
			this.setState({ unread: false });
		})
	}

	updateHalt(data) {
		logDevice('info', `updateHalt for row_news with data: ${data ? JSON.stringify(data) : ''}`);
		this.isMount && checkTradingHalt(this.props.data.symbol).then(snap => {
			let tradingHalt = snap ? snap.trading_halt : false;
			this.setState({ tradingHalt }, () => {
				logDevice('info', `Updated Halt of ${this.props.data.symbol}: ${tradingHalt}`)
			});
		}).catch(err => {
			logDevice('info', `PRICE UNIVERSAL TRADING HALT ERROR: ${err}`);
			console.log(err)
		})
	}

	componentDidMount() {
		this.isMount = true;
		this.updateData();
	}

	componentWillUnmount() {
		this.isMount = false;
		fbemit.deleteEmitter('halt');
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && (nextProps.data !== this.state.data || nextProps.unread !== this.state.unread)) {
			this.setState({
				data: nextProps.data,
				unread: nextProps.unread
			})
		}
	}

	onPress() {
		const item = this.state.data;
		if (!this.state.isDisabled) {
			this.setState({
				isDisabled: true,
				unread: false
			}, () => {
				this.props.renderToLink(item);
				setTimeout(() => {
					this.setState({
						isDisabled: false
					})
				}, 200)
			})
		}
	}

	render() {
		const item = this.state.data;
		if (!item || item.length === 0) {
			return (
				<View />
			);
		}
		const side = item.is_buy === 'S' ? I18n.t('sellUpper', { locale: this.props.setting.lang }) : I18n.t('buyUpper', { locale: this.props.setting.lang });
		const displayName = Business.getSymbolName({ symbol: this.props.data.symbol })
		const flagIcon = Business.getFlag(this.props.data.symbol);
		const time = getCnoteTimeAgo(item.updated);
		return (
			<TouchableOpacity
				style={CommonStyle.rowCnote}
				testID={item.news_id}
				onPress={this.onPress.bind(this)}
				disabled={this.state.isDisabled}
			>
				<View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
					<TextLoad
						isLoading={this.props.isLoading}
						allowFontScaling={false}
						style={{
							fontSize: CommonStyle.fontSizeL,
							fontFamily: CommonStyle.fontPoppinsBold,
							color: CommonStyle.fontColor
						}}>{displayName}</TextLoad>
					<View style={{ width: 8 }} />
					{this.props.isLoading ? null : <Flag
						type="flat"
						code={flagIcon}
						size={18}
					/>}
				</View>
				<ViewLoad
					isLoading={this.props.isLoading}
					forceStyle={{ alignSelf: 'center' }}
					style={{
						backgroundColor: item.is_buy === 'S' ? CommonStyle.color.sellOpa : CommonStyle.color.buyOpa,
						width: 48,
						height: 20,
						borderRadius: 8,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
					<Text allowFontScaling={false}
						style={{
							textAlign: 'center',
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.fontSizeXS,
							lineHeight: 20,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}>
						{side}</Text>
				</ViewLoad>
				<View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<TextLoad
						isLoading={this.props.isLoading}
						allowFontScaling={false} style={CommonStyle.textCnote}>
						{time}</TextLoad>
				</View>
			</TouchableOpacity >
		);
	}
}
