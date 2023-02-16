import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view/index';

export default class ScrollTabView extends ScrollableTabView {
    _handleLayout1 = this._handleLayout1.bind(this);
    _handleLayout1(e) {
        const { width, y } = e.nativeEvent.layout;
        this.props.setPos && this.props.setPos(y);
        if (Math.round(width) !== Math.round(this.state.containerWidth)) {
            this.setState({ containerWidth: width });
            this.requestAnimationFrame(() => {
                this.goToPage(this.state.currentPage);
            });
        }
    }

    render() {
        let overlayTabs =
            this.props.tabBarPosition === 'overlayTop' ||
            this.props.tabBarPosition === 'overlayBottom';
        let tabBarProps = {
            goToPage: this.goToPage,
            tabs: this._children().map(child => child.props.tabLabel),
            activeTab: this.state.currentPage,
            scrollX: this.state.scrollX,
            scrollValue: this.state.scrollValue,
            containerWidth: this.state.containerWidth
        };

        if (this.props.tabBarBackgroundColor) {
            tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
        }
        if (this.props.tabBarActiveTextColor) {
            tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
        }
        if (this.props.tabBarInactiveTextColor) {
            tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
        }
        if (this.props.tabBarTextStyle) {
            tabBarProps.textStyle = this.props.tabBarTextStyle;
        }
        if (this.props.tabBarUnderlineStyle) {
            tabBarProps.underlineStyle = this.props.tabBarUnderlineStyle;
        }

        let obj = {};
        if (this.props.tabBarPosition === 'overlayTop') {
            obj['top'] = 0;
        } else {
            obj['bottom'] = 0;
        }
        if (overlayTabs) {
            tabBarProps.style = {
                position: 'absolute',
                left: 0,
                right: 0,
                ...obj
            };
        }

        return (
            <View
                style={[styles.container, this.props.style]}
                onLayout={this._handleLayout1}
            >
                {this.props.tabBarPosition === 'top' &&
                    this.renderTabBar(tabBarProps)}
                {this.renderScrollableContent()}
                {(this.props.tabBarPosition === 'bottom' || overlayTabs) &&
                    this.renderTabBar(tabBarProps)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollableContentAndroid: {
        flex: 1
    }
});
