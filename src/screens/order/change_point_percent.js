import React, { Component } from 'react';
import { View, Text } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import CommonStyle, { register } from '~/theme/theme_controller'
import ViewLoadReAni from '~/component/loading_component/view1'
export default class ChangePointPercent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading
        };
        this.addListennerOnLoading()
    }
    addListennerOnLoading = () => {
        this.addListennerOnLoading = Emitter.addListener(this.props.channelLoadingOrder, this.addListennerOnLoading, (isLoading) => {
            this.setState({ isLoading })
        })
    }
    unSubAll = () => {
        this.addListennerOnLoading && Emitter.deleteByIdEvent(this.addListennerOnLoading)
    }
    render() {
        return (
            <ViewLoadReAni styleContainer={{ alignSelf: 'flex-start' }} style={{ flexDirection: 'row' }} isLoading={this.state.isLoading}>
                {this.props.children}
            </ViewLoadReAni>
        );
    }
}
