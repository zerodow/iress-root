import React, { Component } from 'react'
import { View, Modal, Text, TouchableOpacity, FlatList, Platform, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { List, ListItem } from 'react-native-elements';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { func, dataStorage } from '../../storage';
import deviceModel from '../../constants/device_model';
import * as Util from '../../util';
import { getTimezoneByLocation, convertTimeGMT, isIphoneXorAbove, isAndroid } from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import config from '../../config';
import * as Controller from '../../memory/controller'
import { connect } from 'react-redux';
import TIME_ZONE from '../../constants/time_zone'
import styles from '@unis/style/universal_search';
import SearchBarTextInput from '~/component/search_bar/search_bar_text_input';

class ModalTimeZone extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible,
            searchInput: false,
            localTimezone: this.props.localTimezone,
            value: this.props.localTimezone,
            data: []
        }
        this.valueInput = this.props.localTimezone || ''
        this.data = TIME_ZONE
        this.deviceModel = dataStorage.deviceModel;
        this.renderHeader = this.renderHeader.bind(this)
        this.renderBody = this.renderBody.bind(this)
        this.searchFunction = this.searchFunction.bind(this)
        this.renderItems = this.renderItems.bind(this)
        this.selectedTimezone = this.selectedTimezone.bind(this)
        this.renderBar = this.renderBar.bind(this)
    }
    selectedTimezone(timezone) {
        Controller.setLocation(timezone)
        this.setState({
            visible: false,
            localTimezone: timezone.value
        })
        this.props.onSelected(timezone)
        this.props.onClose()
    }

    componentDidMount() {
        this.searchFunction(this.state.localTimezone)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.localTimezone) {
            this.searchFunction(nextProps.localTimezone)
        }
    }

    searchFunction(index) {
        if (index !== undefined && index !== null) {
            this.valueInput = index
            if (index === '') {
                this.setState({
                    data: this.data,
                    value: ''
                })
            } else {
                const textData = index.toLowerCase();
                const newData = this.data.filter(item => {
                    const itemData = `${item.value.toLowerCase()}`;
                    return itemData.indexOf(textData) > -1;
                });
                this.setState({
                    data: newData,
                    value: index
                })
            }
        }
    }

    renderItems(item, index) {
        if (item.value === this.state.localTimezone) {
            const objectTimezone = {
                key: item.key,
                value: item.value,
                location: item.location
            }
            console.log('objectTimezone', objectTimezone)
            return (
                <TouchableOpacity onPress={() => this.selectedTimezone(objectTimezone)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: CommonStyle.fontBorderGray, marginHorizontal: 8 }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 16 }}>
                            <Text style={{ fontSize: CommonStyle.fontSizeM, color: CommonStyle.fontBlue }}>{item.value}</Text>
                        </View>
                        <Icon testID={`${item.value}`} size={24} name='md-checkmark' color={CommonStyle.fontBlue} />
                    </View>
                </TouchableOpacity>)
        } else {
            const objectTimezone = {
                key: item.key,
                value: item.value,
                location: item.location
            }
            return (
                <TouchableOpacity onPress={() => this.selectedTimezone(objectTimezone)}>
                    <View style={{ justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 8, paddingVertical: 16, borderBottomWidth: 1, borderColor: CommonStyle.fontBorderGray }}>
                        <Text style={{ fontSize: CommonStyle.fontSizeM, color: CommonStyle.fontColor }}>{item.value}</Text>
                    </View>
                </TouchableOpacity>)
        }
    }

    renderSearchInput() {
        this.setState({
            searchInput: true
        })
    }

    renderHeader() {
        const search = I18n.t('search')
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.colorHeader,
                    height: 64,
                    marginTop: isIphoneXorAbove() ? 24 : 0,
                    justifyContent: Util.getValByPlatform('center', 'flex-start'),
                    alignItems: 'center',
                    width: '100%',
                    paddingLeft: 16,
                    shadowColor: 'rgba(76,0,0,0)',
                    shadowOffset: {
                        width: 0,
                        height: 0.5
                    },
                    flexDirection: 'row'
                }}>
                <View style={{
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(254, 254, 254, 0.2)',
                    borderColor: 'transparent',
                    opacity: 0.7,
                    width: '76%',
                    borderRadius: 8,
                    marginTop: Util.getValByPlatform(16, 0),
                    borderWidth: 1,
                    height: 32
                }}>
                    <Icon name='ios-search' style={[styles.iconSearch2]} />
                    <TextInput
                        // selectionColor={'#FFFFFF'}
                        ref={ref => this.myInput = ref}
                        style={{
                            backgroundColor: 'transparent',
                            height: 32,
                            paddingVertical: 0,
                            width: '80%',
                            fontSize: CommonStyle.fontSizeM,
                            fontFamily: CommonStyle.fontFamily,
                            color: 'rgba(255, 255, 255, 0.87)'
                        }}
                        defaultValue={this.state.localTimezone}
                        value={this.state.value}
                        placeholder={search}
                        blurOnSubmit={true}
                        placeholderTextColor="#fff"
                        autoFocus={true}
                        underlineColorAndroid="rgba(0,0,0,0)"
                        onChangeText={(value) => this.searchFunction(value)}
                    />
                    <Icon name="ios-close-circle"
                        style={[CommonStyle.iconCloseLight]}
                        onPress={() => this.searchFunction('')} />
                </View>
                <TouchableOpacity onPress={() => this.props.onClose()}>
                    <Text style={[CommonStyle.textMain,
                    {
                        color: '#FFF',
                        marginHorizontal: 16,
                        marginTop: Util.getValByPlatform(16, 0),
                        opacity: 1,
                        fontSize: CommonStyle.fontSizeM
                    }]}>{I18n.t('cancel', { locale: this.props.setting.lang })}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderBar() {
        const widthInputSearch = '80%';
        return (
            <SearchBarTextInput
                styleContainer={
                    isAndroid() ? {} : { marginTop: 0, height: isIphoneXorAbove() ? 64 + (38 - 16) : 64, paddingTop: isIphoneXorAbove() ? 38 : 16 }
                }
                textSearch={this.state.value}
                onReset={() => this.searchFunction('')}
                onDismissModal={() => this.props.onClose()}
                onChangeText={(value) => this.searchFunction(value)}
            />
        );
    }

    renderBody() {
        console.log('this.state.data', this.state.data)
        if (this.valueInput.length && !this.state.data.length) {
            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColor }}>
                <Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('noData')}</Text>
            </View>
        }
        return (
            <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <FlatList
                        indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                        showsVerticalScrollIndicator={true}
                        extraData={this.state.data}
                        data={this.state.data}
                        renderItem={({ item, i }) => (
                            this.renderItems(item, i)
                        )} />
                </View>
            </View>
        )
    }

    render() {
        const search = I18n.t('search', { locale: this.props.setting.lang })
        return (
            <React.Fragment>
                <View style={{ justifyContent: 'flex-start', alignItems: 'center', width: '100%', backgroundColor: CommonStyle.colorHeader }}>
                    {this.renderBar()}
                </View>
                {this.renderBody()}
            </React.Fragment>
        )
    }
}
function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}
export default connect(mapStateToProps)(ModalTimeZone)
