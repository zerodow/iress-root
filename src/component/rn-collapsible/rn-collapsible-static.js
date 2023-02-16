import React, { Component } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    Animated,
    Easing
} from 'react-native';
import I18n from '../../modules/language';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller'

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

export default class RnCollapsible extends Component {
    static propTypes = {
        duration: PropTypes.number,
        onChange: PropTypes.func,
        renderContent: PropTypes.func.isRequired,
        isExpand: PropTypes.bool
    }

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onLayoutContent = this.onLayoutContent.bind(this);
        this.onLayoutHeader = this.onLayoutHeader.bind(this);
        this.heightHeader = 0;
        this.heightContent = 0;
        this.heightAnimation = new Animated.Value(0);
        this.dic = {
            iconCollapse: new Animated.Value(0),
            isExpand: typeof this.props.isExpand === 'boolean'
                ? this.props.isExpand
                : false
        };

        this.heightAnimation.addListener(value => {
            console.log('this.heightAnimation.addListener', value)
        })
    }

    onClick() {
        this.props.onChange && this.props.onChange(!this.dic.isExpand);
        this.dic.isExpand = !this.dic.isExpand
        this.execAnimExpand();
        this.execAnimCollapIcon();
        this.props.onAction && this.props.onAction(this.dic.isExpand);
    }

    execAnimExpand() {
        Animated.timing(
            this.heightAnimation,
            {
                toValue: this.dic.isExpand ? this.heightContent + this.heightHeader : this.heightHeader,
                duration: this.props.duration || 0
            }
        ).start(() => {
            console.log('id', this.props.id)
        });
    }

    componentWillReceiveProps(nextProps) {
        if (typeof nextProps.isExpand === 'boolean' && nextProps.isExpand !== this.dic.isExpand) {
            this.dic.isExpand = nextProps.isExpand
            this.execAnimExpand()
        }
    }

    onLayoutContent(event) {
        this.heightContent = event.nativeEvent.layout.height;
        this.dic.isExpand && Animated.timing(
            this.heightAnimation,
            {
                toValue: this.heightHeader + this.heightContent,
                duration: this.props.duration || 0
            }
        ).start();
    }

    onLayoutHeader(event) {
        /* Fix bug không render khi default isExpand = true
            1> Chay bat dong bo onLayoutHeader && onLayoutContent
            2> Fix:
                a> Neu dang mo thi height = header + content
                b> Neu dang dong thi height = header
        */
        this.heightHeader = event.nativeEvent.layout.height;
        const heightAnimation = this.dic.isExpand
            ? this.heightContent + this.heightHeader
            : this.heightHeader
        this.heightAnimation.setValue(heightAnimation);
    }

    execAnimCollapIcon(duration = 150) {
        const curValue = this.dic.iconCollapse._value || 0;
        Animated.timing(
            this.dic.iconCollapse,
            {
                toValue: Math.abs(curValue - 1),
                duration,
                easing: Easing.linear
            }
        ).start()
    }

    renderHeader = (title) => {
        const spin = this.dic.iconCollapse.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-90deg']
        })
        return (
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
                <AnimatedIcon style={[CommonStyle.iconColapsible, {
                    color: CommonStyle.fontColor,
                    transform: [{
                        rotate: spin
                    }]
                }]} name="ios-arrow-down" />
                <Text style={{ fontFamily: 'HelveticaNeue', fontSize: CommonStyle.fontSizeL, color: CommonStyle.fontColor, paddingLeft: 8 }}>{I18n.t(this.props.title)}</Text>
            </View>
        );
    }

    render() {
        const styleAnimated = this.heightHeader
            ? { height: this.heightAnimation, overflow: 'hidden' }
            : {};
        return (
            <Animated.View style={styleAnimated}>
                <TouchableOpacity onPress={this.onClick} onLayout={this.onLayoutHeader}>
                    {this.renderHeader()}
                </TouchableOpacity>
                <View onLayout={this.onLayoutContent}>
                    {
                        this.props.renderContent()
                    }
                </View>
            </Animated.View>
        );
    }
};
