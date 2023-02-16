import React, { Component } from 'react';
import {
    Text,
    View,
    LayoutAnimation,
    UIManager,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';

import CommonStyle from '~/theme/theme_controller';

if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visiable: false,
            func: () => null
        };
    }

    closeModal = this.closeModal.bind(this);
    closeModal(cb) {
        Platform.OS === 'ios' && LayoutAnimation.easeInEaseOut();
        this.setState(
            {
                visiable: false
            },
            () =>
                setTimeout(() => {
                    cb && cb();
                }, 10)
        );
    }

    showModal = this.showModal.bind(this);
    showModal(func) {
        if (func) {
            this.setState({
                visiable: true,
                func
            });
        }
    }
    render() {
        if (!this.state.visiable) return null;
        return (
            <TouchableWithoutFeedback onPress={() => this.closeModal()}>
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        zIndex: 100,
                        position: 'absolute'
                    }}
                >
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            backgroundColor: CommonStyle.color.bg,
                            opacity: 0.85
                        }}
                    />
                    {this.state.func()}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
