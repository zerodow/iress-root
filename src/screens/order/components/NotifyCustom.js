import React, { Component } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import CommonStyle from '~/theme/theme_controller'
import Styles from '~/component/notify_order/style/alert_order.js';
import Highlighter from 'react-native-highlight-words';
import Enum from '~/enum';
const { width } = Dimensions.get('window');
const HEIGHT = 24;
const TYPE = {
    WARNING: Styles.warningContainer1,
    ERROR: Styles.errorContainer1
};
const TEXT = {
    WARNING: CommonStyle.textSubRed,
    ERROR: CommonStyle.textSubWhite,
    error1: CommonStyle.textSubRed
};

module.exports = class NotifyOrder extends Component {
    constructor(props) {
        super(props);
        this.isMount = false;
        this.props = props;
        this.error = this.props.text;
        this.animatedValue = new Animated.Value(-100);
        this.state = {
            text: '',
            type: TYPE.error
        }
    }

    //  #region REACT FUNCTION
    componentWillReceiveProps(nextProps = {}) {
        // const { text: error = '' } = nextProps;
        // if (!error && this.error) {
        // 	this.error = error
        // 	this.endAnimate()
        // 	return
        // };
        // if (error) {
        // 	this.error = error;
        // 	this.startAnimate()
        // }
        // // this.error = `${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error} ${this.error}`;
    }
    showMessage = ({ text, type }, cb) => {
        this.setState({
            text, type
        }, () => {
            setTimeout(() => {
                this.startAnimate(cb)
            }, 0);
        })
    }
    hideMessage = (cb) => {
        this.endAnimate(cb)
    }
    componentDidMount() {
        this.isMount = true;
    }

    componentWillUnmount() {
        this.isMount = false;
    }
    getBgColor = (type = Enum.TYPE_MESSAGE.ERROR) => {
        switch (type) {
            case Enum.TYPE_MESSAGE.ERROR:
                return CommonStyle.color.error
            case Enum.TYPE_MESSAGE.WARNING:
                return CommonStyle.color.warning
            default:
                return CommonStyle.color.warning
        }
    }
    setRefTextMes = this.setRefTextMes.bind(this)
    setRefTextMes(ref) {
        this.refTextMessage = ref
    }
    render() {
        const type = this.state.type;
        const bg = this.getBgColor(type)
        if (!this.state.text) return <View />
        return (
            <Animated.View
                style={[
                    TYPE[type],
                    {
                        transform: [
                            {
                                translateY: this.animatedValue
                            }
                        ],
                        position: 'absolute',
                        justifyContent: 'flex-end',
                        left: 0,
                        right: 0,
                        backgroundColor: CommonStyle.ColorTabNews
                    }
                    // this.props.isOutsideHeader ? { backgroundColor: type ? CommonStyle.color[type] : CommonStyle.backgroundColor1 } : {}
                ]}>
                {
                    <View style={{ backgroundColor: bg, width: '100%', alignItems: 'center', height: '100%' }}>
                        <Text
                            ref={this.setRefTextMes}
                            style={[
                                [TEXT[type]],
                                {
                                    paddingTop: 4,
                                    paddingBottom: 4,
                                    paddingLeft: 14,
                                    paddingRight: 14
                                }
                            ]}>
                            {this.state.text}
                        </Text>
                    </View>
                }
            </Animated.View>
        );
    }

    //  #endregion

    //  #region BUSINESS
    timeoutFn(cb) {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        this.timeout = setTimeout(() => {
            this.endAnimate(cb)
        }, 3000);
    }

    startAnimate(cb) {
        const height = this.props.getHeightHeaderContent ? this.props.getHeightHeaderContent() : 46
        Animated.timing(this.animatedValue, {
            duration: 300,
            toValue: height,
            easing: Easing.linear
        }).start(() => {
            cb && cb()
            this.timeoutFn();
        });
    }

    endAnimate(cb) {
        Animated.timing(this.animatedValue, {
            toValue: -100,
            duration: 300,
            easing: Easing.linear
        }).start(() => {
            this.setState({
                text: ''
            })
            cb && cb()
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
