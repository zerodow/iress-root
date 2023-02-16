import React, { PureComponent } from 'react'
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
// Components
import Ionicons from 'react-native-vector-icons/Ionicons';
// Common
import * as Controller from '~/memory/controller'
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '~/streaming/channel'
export default class TopIconPanel extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: false
        }
        this.subLoadingChannel()
    }
    subLoadingChannel = () => {
        this.idSubLoading = Emitter.addListener(Channel.getChannelAlertLoading(), this.id, (status) => {
            if (this.state.loading !== status) {
                this.setState({ loading: status })
            }
        });
    }
    unSubLoadingChannel = () => {
        this.idSubLoading && Emitter.deleteByIdEvent(this.idSubLoading);
    }
    componentWillUnmount() {
        this.unSubLoadingChannel()
    }
    handleC2R = () => {
        this.props.handleC2R && this.props.handleC2R()
    }
    onClose = () => {
        this.props.onClose && this.props.onClose()
    }
    renderC2RIcon = () => {
        if (Controller.isPriceStreaming()) return null
        return (
            <TouchableOpacity
                onPress={this.handleC2R}
            >
                {
                    this.state.loading ? (<ActivityIndicator size='small' color={CommonStyle.fontColor} />) : (
                        <Ionicons
                            style={{
                                alignSelf: 'center'
                            }}
                            name='ios-refresh-outline'
                            fontWeight='bold' color={CommonStyle.fontColor}
                            size={26} />
                    )
                }
            </TouchableOpacity>
        )
    }
    renderCloseIcon() {
        return <TouchableOpacity
            onPress={this.onClose}
            style={{ alignContent: 'center', justifyContent: 'center', marginLeft: 24 }}
        >
            <View style={{ borderRadius: 48, width: 18, height: 18, backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3, alignContent: 'center', justifyContent: 'center' }}>
                <Ionicons
                    name='md-close' color={CommonStyle.backgroundColor}
                    style={{ textAlign: 'center', lineHeight: 18 }}
                    size={12} />
            </View>
        </TouchableOpacity>
    }
    renderDragIcon = () => {
        return (
            <View style={{ width: '40%', alignContent: 'center', alignItems: 'center' }} >
                <View style={[CommonStyle.dragIcons, { width: 36, marginTop: 0 }]} />
            </View>
        )
    }
    renderDragHandler() {
        return (
            <View style={{ flexDirection: 'row', paddingTop: 8, justifyContent: 'space-between', borderTopLeftRadius: 16, borderTopRightRadius: 16, ...this.props.style }}>
                <View style={{ width: '30%' }}>

                </View>
                <View style={{ width: '40%', alignContent: 'center', alignItems: 'center' }} >
                    <View style={[CommonStyle.dragIcons, { width: 36, marginTop: 0 }]} />
                </View>
                <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: CommonStyle.paddingSize }}>
                    {this.renderC2RIcon()}
                    {this.renderCloseIcon()}
                </View>
            </View>
        )
    }
    renderDragHandlerWithoutDragIcon = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: CommonStyle.paddingSize, ...this.props.style }}>
                {this.renderC2RIcon()}
                {this.renderCloseIcon()}
            </View>
        )
    }
    render() {
        return (
            <React.Fragment>
                {this.props.isShowDragIcon ? this.renderDragHandler() : this.renderDragHandlerWithoutDragIcon()}
            </React.Fragment>
        )
    }
}
TopIconPanel.defaultProps = {
    isShowDragIcon: true
}
