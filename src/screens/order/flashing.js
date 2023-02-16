import React, { Component, PureComponent } from 'react';
import { View, Text } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import ViewLoadingReAni from '~/component/loading_component/view1'
import CommonStyle, { register } from '~/theme/theme_controller'
export default class Flashing extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading
        };
        this.addListennerOnLoading()
    }
    addListennerOnLoading = () => {
        this.idLoadingEvent = Emitter.addListener(this.props.channelLoadingOrder, this.idLoadingEvent, (isLoading) => {
            if (this.state.isLoading !== isLoading) {
                this.setState({ isLoading })
            }
        })
    }
    componentWillUnmount() {
        this.unSubAll()
    }
    unSubAll = () => {
        this.idLoadingEvent && Emitter.deleteByIdEvent(this.idLoadingEvent)
    }
    render() {
        return (
            <View style={[{ justifyContent: 'center' }, this.props.style || {}]}>
                <ViewLoadingReAni isLoading={this.state.isLoading}>
                    {this.props.children}
                </ViewLoadingReAni>
            </View>
        );
    }
}
