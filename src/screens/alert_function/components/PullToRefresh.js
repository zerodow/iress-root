import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import TimeUpdated from './TimeUpdated';
import { connect } from 'react-redux';
// Styles
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Controller from '~/memory/controller';
class TextTime extends Component {
    render() {
        const { str } = this.props;
        if (Controller.isPriceStreaming()) {
            return (
                <View style={{ paddingLeft: 16 }}>
                    <Text style={CommonStyle.timeUpdatedTitleHeaderNavBar}>
                        {}
                    </Text>
                </View>
            );
        }
        return (
            <View
                onLayout={this.props.handleCalHeightText}
                style={{ paddingVertical: 8, paddingLeft: 16 }}
            >
                <Text style={CommonStyle.timeUpdatedTitleHeaderNavBar}>
                    {str}
                </Text>
            </View>
        );
    }
}

const TextTimeRedux = connect((state) => ({
    textFontSize: state.setting.textFontSize
}))(TextTime);

export default class PullToRefresh extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heightText: 24
        };
    }
    updateTime = () => {
        this.refUpdateTime &&
            this.refUpdateTime.setTimeUpdate(new Date().getTime());
    };
    renderTimeComp = (time) => {
        let str = `${I18n.t('Updated')} ${time} Pull to refresh`;
        return (
            <TextTimeRedux
                handleCalHeightText={this.handleCalHeightText}
                str={str}
            />
        );
    };
    handleCalHeightText = this.handleCalHeightText.bind(this);
    handleCalHeightText(event) {
        const { height } = event.nativeEvent.layout;
        this.setState({
            heightText: height
        });
    }
    render() {
        const height = Controller.isPriceStreaming() ? 6 : 28;
        return (
            <View style={{ backgroundColor: CommonStyle.ColorTabNews }}>
                <View
                    style={{
                        overflow: 'visible',
                        height: 500 + this.state.heightText,
                        marginTop: -500,
                        marginLeft: -35,
                        justifyContent: 'flex-end',
                        paddingLeft: 35,
                        borderRadius: 30,
                        backgroundColor: CommonStyle.fontDark3
                    }}
                >
                    <View style={{ paddingBottom: 32 }}>
                        <ActivityIndicator />
                    </View>
                    <TimeUpdated
                        styleWrapper={{}}
                        renderTimeComp={this.renderTimeComp}
                        isShow={true}
                        ref={(refTime) => (this.refUpdateTime = refTime)}
                    />
                </View>
            </View>
        );
    }
}
