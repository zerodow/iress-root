import React, { Component } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import CommonStyle from '~/theme/theme_controller'
import Styles from './style/alert_order';
import Highlighter from 'react-native-highlight-words';

const { width } = Dimensions.get('window');
const HEIGHT = 24;
const TYPE = {
	warning: Styles.warningContainer,
	error: Styles.errorContainer
};
const TEXT = {
	warning: CommonStyle.textSubRed,
	error: CommonStyle.textSubWhite,
	error1: CommonStyle.textSubRed
};

module.exports = class NotifyOrder extends Component {
	constructor(props) {
		super(props);
		this.isMount = false;
		this.props = props;
		this.error = this.props.text;
		this.animatedValue = new Animated.Value(0);
	}

	//  #region REACT FUNCTION
	componentWillReceiveProps(nextProps = {}) {
		const { text: error = '' } = nextProps;
		if (!error && this.error) {
			this.error = error
			this.endAnimate()
			return
		};
		if (error) {
			this.error = error;
			this.startAnimate()
		}
		// this.error = `${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error}`;
	}

	componentDidMount() {
		this.isMount = true;
		if (this.props.text) this.startAnimate();
	}

	componentWillUnmount() {
		this.isMount = false;
	}

	render() {
		const type = this.props.type;
		if (!this.props.text) return <View />
		return (
			<Animated.View
				style={[
					TYPE[type],
					{
						height: this.animatedValue,
						overflow: 'hidden',
						zIndex: 9999
					},
					this.props.isOutsideHeader ? { backgroundColor: type ? CommonStyle.color[type] : CommonStyle.backgroundColor1 } : {}
				]}>
				{
					this.props.highlighted
						? <Highlighter
							highlightStyle={this.props.highlightedStyle}
							searchWords={this.props.highlightedWord}
							textToHighlight={this.props.text}
							style={[
								[TEXT[type]],
								{
									paddingTop: 3,
									paddingBottom: 3,
									paddingLeft: 14,
									paddingRight: 14
								}
							]} />
						: <Text
							style={[
								[TEXT[type]],
								{
									paddingTop: 3,
									paddingBottom: 3,
									paddingLeft: 14,
									paddingRight: 14
								}
							]}>
							{this.props.text}
						</Text>
				}
			</Animated.View>
		);
	}

	//  #endregion

	//  #region BUSINESS
	timeoutFn() {
		if (this.timeout) {
			clearTimeout(this.timeout)
		}
		this.timeout = setTimeout(() => {
			Animated.timing(this.animatedValue, {
				toValue: 0,
				duration: 300
			}).start(() => {
				this.props.clearErrorFn && this.props.clearErrorFn()
			})
		}, 5000);
	}

	startAnimate() {
		const animHeight = (this.getNumberOfLines(this.error, CommonStyle.fontSizeS, 2.06, width)) * HEIGHT;
		Animated.timing(this.animatedValue, {
			duration: 300,
			toValue: animHeight
		}).start(() => {
			this.timeoutFn();
		});
	}

	endAnimate() {
		Animated.timing(this.animatedValue, {
			toValue: 0,
			duration: 300
		}).start(() => {
			this.props.clearErrorFn && this.props.clearErrorFn()
		})
	}

	/**
	 * Return the number of lines for specific text with font size = 14 and font constant = 2.06 (Poppins font).
	 * {@link https://stackoverflow.com/questions/38386704/react-native-determine-number-of-lines-of-text-component StackOverFlow}
	 * {@link https://pearsonified.com/characters-per-line/ CPL}
	 */
	getNumberOfLines(text, fontSize, fontConstant, containerWidth) {
		const cpl = Math.floor(containerWidth / (fontSize / fontConstant));
		const words = (text + '').split(' ');
		const elements = [];
		let line = '';

		while (words.length > 0) {
			if (line.length + words[0].length + 1 <= cpl || (line.length === 0 && words[0].length + 1 >= cpl)) {
				const word = words.splice(0, 1);
				if (line.length === 0) {
					line = word;
				} else {
					line = line + ' ' + word;
				}
				if (words.length === 0) {
					elements.push(line);
				}
			} else {
				elements.push(line);
				line = '';
			}
		}
		return elements.length;
	}

	//  #endregion
}
