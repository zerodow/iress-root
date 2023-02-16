import React, { Component } from 'react';
import { View, Text } from 'react-native';
import CustomTabbar from '~/screens/watchlist/Detail/components/ScrollTabbar';
export default class MarketInfoTabView extends CustomTabbar {
    componentDidMount() {
        super.componentDidMount()
        // this.onSpaceLayout()
    }
    onTabContainerLayout1(e) {
        this._tabContainerMeasurements = e.nativeEvent.layout;

        this.promt = () =>
            new Promise(resolve => {
                let width = this._tabContainerMeasurements.width;
                const maxWidth =
                    (this._containerMeasurements &&
                        this._containerMeasurements.width) ||
                    0;
                if (width < maxWidth) {
                    width = maxWidth;
                }
                this.setState({ _containerWidth: width });
                this.updateView({ value: this.props.scrollValue._value });
            });
    }
    handleListenerOnLayout = (e) => {
        const { width, height } = e.nativeEvent.layout
        this.props.handlleOnLayout && this.props.handlleOnLayout(height)
        if (width > 0) {
            super.onSpaceLayout()
        }
    }
}
