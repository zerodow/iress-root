import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native'
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import styles from './style/business_log'
import config from '../../config';
import I18n from '../../modules/language';
import { dataStorage, func } from '../../storage'
import BusinessLogFilterTime from './business_log_filter_time'
import BusinessLogFilterAction from './business_log_filter_action'
import Enum from '../../enum'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Util from '../../util'
import * as Controller from '../../memory/controller'
import * as InvertTranslate from '../../invert_translate'
import * as businessLogActions from './business_log.actions'
import deviceModel from '../../constants/device_model';
import { getTimezoneByLocation, isIphoneXorAbove } from '../../lib/base/functionUtil'

const { LIST_FILTER_TIME, LIST_FILTER_ACTION, LIST_FILTER_ACTION_OPERATOR } = Enum
const { height, width } = Dimensions.get('window');
const duration = {
    fromDate: null,
    toDate: null,
    isCustom: true
}
class BusinessLogFilter extends Component {
    constructor(props) {
        super(props)
        // Value
        this.location = Controller.getLocation().location
        this.listItemFilterTime = Util.getValueObject(LIST_FILTER_TIME)
        this.listItemFilterAction = Controller.getUserRole() === 'operation' ? Util.getValueObject(LIST_FILTER_ACTION_OPERATOR) : Util.getValueObject(LIST_FILTER_ACTION)
        this.listFilterTime = InvertTranslate.getListInvertTranslate(this.listItemFilterTime)
        this.listFilterAction = InvertTranslate.getListInvertTranslate(this.listItemFilterAction)
        this.tabSelect = 'time'
        this.filterTime = this.props.bLog.duration
        this.filterAction = this.props.bLog.action
        this.filterActionDisplay = Util.getFilterActionDisplay(this.filterAction)
        // State
        this.state = {
        }
        this.renderTabFilter = this.renderTabFilter.bind(this)
        this.setTabActive = this.setTabActive.bind(this)
        this.cancelFilter = this.cancelFilter.bind(this)
        this.doneFilter = this.doneFilter.bind(this)
        this.onSelectedTime = this.onSelectedTime.bind(this)
        this.onSelectedAction = this.onSelectedAction.bind(this)
        this.customDuration = this.props.bLog.customDuration || duration
    }

    setTabActive(tabActive) {
        this.tabSelect = tabActive
        this.setState({})
    }

    cancelFilter() {
        this.props.onClose && this.props.onClose()
    }

    doneFilter() {
        this.props.onSelected && this.props.onSelected(this.filterTime, this.filterAction, customDuration = this.customDuration)
    }

    renderHeader() {
        const {
            filterHeaderWrapper,
            filterLeftButton,
            filterRightButton,
            filterTitle,
            leftButton,
            rightButton,
            title
        } = styles
        return (
            <View style={[filterHeaderWrapper, isIphoneXorAbove() ? { paddingTop: 16, height: 56 + 16 - 24, marginBottom: 4 } : { marginBottom: 4 }]}>
                <View style={[filterLeftButton]}>
                    <TouchableOpacity
                        style={{ paddingTop: 11 }}
                        onPress={this.cancelFilter}>
                        <Text
                            style={CommonStyle.leftButton}>
                            {I18n.t('cancel')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={CommonStyle.filterTitle}>
                    <View style={{ paddingTop: 8 }}>
                        <Text style={[title, { color: CommonStyle.fontColor }]}>
                            {I18n.t('filter')}
                        </Text>
                    </View>
                </View>

                <View style={CommonStyle.filterRightButton}>
                    <TouchableOpacity
                        style={{ paddingTop: 11 }}
                        onPress={this.doneFilter}>
                        <Text
                            style={CommonStyle.rightButton}>
                            {I18n.t('done')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderTabFilter() {
        const {
            filterTabBarWrapper, tabBar, borderLeftTab, borderRightTab, borderLeftTabRadius, borderRightTabRadius, textTab
        } = styles
        const businessLogFilterTime = (
            <BusinessLogFilterTime
                listItem={this.listFilterTime}
                customDuration={this.customDuration}
                onSelected={this.onSelectedTime.bind(this)}
                selectedItem={this.filterTime} />)
        const businessLogFilterAction = (
            <BusinessLogFilterAction
                listItem={this.listFilterAction}
                onSelected={this.onSelectedAction.bind(this)}
                selectedItem={this.filterActionDisplay} />)
        return (
            <Tabs
                contentProps={{
                    keyboardShouldPersistTaps: 'always'
                }}
                style={[{
                    backgroundColor: CommonStyle.backgroundColor
                }]}
                onChangeTab={(tabInfo) => {
                    if (this.setButton) {
                        this.setButton(tabInfo, true)
                    }
                }}
                tabBarUnderlineStyle={{ height: dataStorage.platform === 'ios' ? 0 : 2, backgroundColor: CommonStyle.backgroundColor }}
                renderTabBar={() => <ScrollableTabBar activeTab={1} activeTextColor={CommonStyle.fontWhite} backgroundColor={CommonStyle.colorHeaderNews}
                    style={{ borderColor: CommonStyle.fontBorderGray }}
                    renderTab={(name, page, isTabActive, onPressHandler, onLayoutHandler) => {
                        return (
                            <TouchableOpacity
                                key={page}
                                onPress={() => onPressHandler(page)}
                                onLayout={onLayoutHandler}
                                style={{
                                    height: 30,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRightColor: CommonStyle.btnTabActiveBgColor,
                                    borderTopColor: CommonStyle.btnTabActiveBgColor,
                                    borderTopWidth: 1,
                                    borderBottomColor: CommonStyle.btnTabActiveBgColor,
                                    borderBottomWidth: 1,
                                    marginLeft: page === 0 ? 16 : 0,
                                    marginRight: page === 1 ? 16 : 0,
                                    borderLeftColor: CommonStyle.btnTabActiveBgColor,
                                    backgroundColor: isTabActive ? CommonStyle.btnTabActiveBgColor : CommonStyle.btnTabInactiveBgColor,
                                    borderLeftWidth: 1,
                                    borderRightWidth: page === 1 ? 1 : 0,
                                    borderTopLeftRadius: page === 0 ? 4 : 0,
                                    borderBottomLeftRadius: page === 0 ? 4 : 0,
                                    borderTopRightRadius: page === 1 ? 4 : 0,
                                    borderBottomRightRadius: page === 1 ? 4 : 0,
                                    width: (width - 32) / 2
                                }}>
                                <Text testID={'TabText' + page} style={{
                                    color: isTabActive ? CommonStyle.textActiveColor : CommonStyle.textInactiveColor,
                                    fontFamily: 'HelveticaNeue',
                                    fontSize: CommonStyle.font13,
                                    fontWeight: '300',
                                    textAlign: 'center'
                                }}>{name}</Text>
                            </TouchableOpacity>);
                    }} />} >

                <View tabLabel={I18n.t('time')} style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                    {
                        businessLogFilterTime
                    }
                </View>
                <View tabLabel={I18n.t('action')} style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                    {
                        businessLogFilterAction
                    }
                </View>
                {/* <TouchableOpacity
                        tabLabel='Tab #1'
                        onPress={() => this.setTabActive('time')}
                        style={[
                            tabBar,
                            borderLeftTab,
                            borderLeftTabRadius,
                            { backgroundColor: this.tabSelect === 'time' ? '#ffffff' : CommonStyle.statusBarBgColor }
                        ]}>
                        <Text style={[textTab, { color: this.tabSelect === 'time' ? CommonStyle.statusBarBgColor : '#ffffff', textAlign: 'center' }]}>
                            {I18n.t('time')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        tabLabel='Tab #2'
                        onPress={() => this.setTabActive('action')}
                        style={[
                            tabBar,
                            borderRightTab,
                            borderRightTabRadius,
                            { backgroundColor: this.tabSelect === 'time' ? CommonStyle.statusBarBgColor : '#ffffff' }
                        ]}>
                        <Text style={[textTab, { color: this.tabSelect === 'time' ? '#ffffff' : CommonStyle.statusBarBgColor, textAlign: 'center' }]}>
                            {I18n.t('action')}
                        </Text>
                    </TouchableOpacity> */}
            </Tabs >
        )
    }

    onSelectedTime(value, customDuration = null) {
        this.filterTime = value
        this.customDuration = customDuration
    }

    onSelectedAction(value) {
        this.filterAction = value
        this.filterActionDisplay = Util.getFilterActionDisplay(this.filterAction)
    }

    render() {
        const { filterWrapper } = styles
        return (
            <View style={[filterWrapper]}>
                {
                    this.renderHeader()
                }
                {
                    this.renderTabFilter()
                }
                {/* <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                    {
                        this.tabSelect === 'time'
                            ? <BusinessLogFilterTime
                                listItem={this.listFilterTime}
                                onSelected={this.onSelectedTime.bind(this)}
                                selectedItem={this.filterTime} />
                            : <BusinessLogFilterAction
                                listItem={this.listFilterAction}
                                onSelected={this.onSelectedAction.bind(this)}
                                selectedItem={this.filterActionDisplay} />
                    }
                </View> */}
            </View>
        )
    }
}

function mapStateToProps(state) {
    return {
        bLog: state.bLog,
        isConnected: state.app.isConnected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(businessLogActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessLogFilter);
