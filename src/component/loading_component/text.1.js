import React, { Component, PureComponent } from 'react';
import { View, Text, LayoutAnimation, UIManager, Platform, InteractionManager } from 'react-native';
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
export default class TextLoadingCustom extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: this.props.isLoading || null
        }
        this.layoutAnimationActive = false
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoading !== this.state.isLoading) {
            if (!this.layoutAnimationActive) {
                this.layoutAnimationActive = true;
                InteractionManager.runAfterInteractions(() => {
                    LayoutAnimation.configureNext(
                        LayoutAnimation.create(
                            100,
                            LayoutAnimation.Types.easeOut,
                            LayoutAnimation.Properties.opacity
                        ),
                        () => {
                            this.layoutAnimationActive = false
                        }
                    );
                    this.setState({
                        isLoading: nextProps.isLoading
                    })
                })
            }
        }
    }

    renderLoadingState() {
        const {
            style,
            children,
            formatTextAbs,
            styleViewLoading,
            ...props
        } = this.props
        return (
            <View
                style={[
                    {
                        backgroundColor: '#ffffff30',
                        borderRadius: 4
                    },
                    styleViewLoading || {}
                ]}>
                <Text
                    {...props}
                    style={[style, { opacity: 0 }]}>
                    {
                        children && children.length > 0
                            ? children
                            : (formatTextAbs || 'AAAA')
                    }
                </Text>
            </View>
        )
    }

    render() {
        if (this.props.isLoading) {
            return this.renderLoadingState()
        }

        return (<Text {...this.props} />)
    }
}
