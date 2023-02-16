import React, { Componen, PureComponent } from 'react'
import { Text, View } from 'react-native'
// Redux
import { connect } from 'react-redux'
// ENUM
import ENUM from '~/enum'
// Components
import Header from '~/component/headerNavBar/index'
import ContentHeader from './Content'
import RightContentHeader from './IconLeft'
import SearchBar from '../SearchBar/index'
import Icon from '~/component/headerNavBar/icon'
import TimeUpdated from '../TimeUpdated'
// Styles
import CommonStyle, { register } from '~/theme/theme_controller'
// Store
import * as Controller from '~/memory/controller'
import I18n from '~/modules/language/'
import { changeScreenActive } from '../../redux/actions'
import { dataStorage, func } from '~/storage'
import ScreenId from '~/constants/screen_id'
import Icons from '@component/headerNavBar/icon';
const { ALERT_SCREEN, SCREEN } = ENUM

class HeaderWrapper extends PureComponent {
    componentDidMount() {
        this.refUpdateTime && this.refUpdateTime.setTimeUpdate(new Date().getTime())
    }
    renderHeaderSpecial = () => {
        if (!this.props.screen) return null
        switch (this.props.screen) {
            case ALERT_SCREEN.LIST_ALERT: // Header co icon
                return this.renderHeaderListAlert()
            case ALERT_SCREEN.NEW_ALERT: // Header la search bar
                return this.renderHeaderNewAlert()
            case ALERT_SCREEN.MODIFY_ALERT: // Cac header chi co text
                return this.renderHeaderDefault()
            case ALERT_SCREEN.DETAIL_MODIFY_ALERT:
                return this.renderHeaderDefault()
            case ALERT_SCREEN.DETAIL_NEW_ALERT:
                return this.renderHeaderDefault()
            default:
                return this.renderHeaderListAlert()
        }
    }
    getTitle = () => {
        if (!this.props.screen) return ''
        switch (this.props.screen) {
            case ALERT_SCREEN.LIST_ALERT:
                return 'Alerts'
            case ALERT_SCREEN.NEW_ALERT:
                return 'New Alert'
            case ALERT_SCREEN.MODIFY_ALERT:
                return 'Alerts'
            case ALERT_SCREEN.DETAIL_MODIFY_ALERT:
                return 'Modify Alert'
            case ALERT_SCREEN.DETAIL_NEW_ALERT:
                return 'New Alert'
            default:
                return 'Alerts'
        }
    }
    componentWillReceiveProps(nextProps) {

    }

    openMenu = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.toggleDrawer({
                side: 'left',
                animated: true
            });
        }
    }

    renderMainLeftComp = () => {
        return (
            <View style={{ left: -14 }}>
                <Icons styles={{ paddingRight: 16 }} name='ios-menu' onPress={this.openMenu} size={34} />
            </View>
        );
    }

    renderHeaderListAlert = () => {
        return (
            <Header
                leftIcon='ios-menu'
                navigator={this.props.navigator}
                title={I18n.t('portfolio')}
                rightStyles={{
                    height: '100%'
                }}
                renderLeftComp={this.renderMainLeftComp}
                renderContent={this.renderContentHeader}
                // style={{ paddingTop: 16 }}
                containerStyle={{
                    borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
                    overflow: 'hidden'
                }}
                firstChildStyles={{ minHeight: 18 }}
                style={{
                    marginLeft: 0,
                    paddingTop: 16
                }}
                renderRightComp={this.renderRightHeader}
            >
                <View />

            </Header>
        )
    }
    renderHeaderNewAlert = () => {
        if (!this.props.isSearchBar) return null
        const { setRefInput, onChangeText, onCancel, textSearch, onReset } = this.props.isSearchBar
        return (
            <SearchBar
                navigator={this.props.navigator}
                setRefInput={setRefInput}
                onChangeText={onChangeText}
                onCancel={onCancel}
                textSearch={textSearch}
                onReset={onReset}
            />
        )
    }
    moveToModifyAlert = () => {
        this.props.navigator.showModal({
            screen: SCREEN.ADD_ALERT,
            overrideBackPress: true,
            title: I18n.t('alertUpper'),
            backButtonTitle: '',
            animated: true,
            animationType: 'none',
            passProps: {
                navigatorEventIDParents: this.props.navigator.navigatorEventID
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }
    moveToNewAlert = () => {
        this.props.navigator.showModal({
            screen: SCREEN.NEW_ALERT,
            overrideBackPress: true,
            title: I18n.t('newOrder'),
            backButtonTitle: '',
            animated: true,
            animationType: 'none',
            passProps: {
                navigatorEventIDParents: this.props.navigator.navigatorEventID
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }
    renderContentHeader = () => {
        const title = this.getTitle() || ''
        return (
            <ContentHeader style={{ marginLeft: this.props.screen === ALERT_SCREEN.LIST_ALERT ? 0 : 8 }} header={{ title }} />
        )
    }
    setRefRightIcon = (ref) => {
        if (ref) {
            this.refIconRight = ref
        }
    }
    renderRightHeader = () => (<RightContentHeader ref={this.setRefRightIcon} isDisableEdit={this.props.isDisableEdit} handleShowNew={this.moveToNewAlert} handleShowListModify={this.moveToModifyAlert} />)
    renderLeftComp = () => {
        return (
            <View
                style={{
                    paddingLeft: 16,
                    width: 32,
                    alignItems: 'flex-start'
                }}
            >
                <Icon name={'ios-arrow-back'} onPress={this.handlePressLeftIcon} />
            </View>
        )
    }
    handlePressLeftIcon = () => {
        switch (this.props.screen) {
            case ALERT_SCREEN.DETAIL_MODIFY_ALERT:
                // Controller.dispatch(changeScreenActive(ALERT_SCREEN.MODIFY_ALERT))
                func.setCurrentScreenId(ScreenId.ADD_ALERT)
                this.props.onClose(() => {
                    this.props.navigator && this.props.navigator.dismissModal({
                        animated: false, // does the pop have transition animation or does it happen immediately (optional)
                        animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
                    });
                })
                break;
            case ALERT_SCREEN.MODIFY_ALERT:
                // Controller.dispatch(changeScreenActive(ALERT_SCREEN.LIST_ALERT))
                func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER)
                this.props.onClose(() => {
                    this.props.navigator && this.props.navigator.dismissModal({
                        animated: false, // does the pop have transition animation or does it happen immediately (optional)
                        animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
                    });
                })
                break;
            default:
                break;
        }
    }
    renderTimeComp = (time) => {
        let str = `${I18n.t('Updated')} ${time} Pull to refresh`;
        if (Controller.isPriceStreaming()) {
            return (
                <View style={{ paddingLeft: 16 }}>
                    <Text style={CommonStyle.timeUpdatedTitleHeaderNavBar} >{}</Text>
                </View>
            )
        }
        return (
            <View style={{ paddingVertical: 8, paddingLeft: 16 }}>
                <Text style={CommonStyle.timeUpdatedTitleHeaderNavBar} >{str}</Text>
            </View>
        )
    }
    renderUpdateTime() {
        return <TimeUpdated styleWrapper={{}} renderTimeComp={this.renderTimeComp} isShow={true} ref={refTime => this.refUpdateTime = refTime} />
    }
    renderHeaderModifyAlert = () => {
        const isStreaming = Controller.isPriceStreaming()
        return (
            <Header
                leftIcon='ios-menu'
                navigator={this.props.navigator}
                renderContent={this.renderContentHeader}
                containerStyle={{
                    borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
                    overflow: 'hidden'
                }}
                firstChildStyles={{
                    minHeight: 18,
                    overflow: 'visible',
                    borderBottomRightRadius: CommonStyle.borderBottomRightRadius
                }}
                rightStyles={{
                    height: '100%'
                }}
                renderLeftComp={this.renderLeftComp}
                style={{ paddingTop: 16 }}
            >
                <View />
            </Header>
        )
    }
    renderHeaderDefault = () => {
        const isStreaming = Controller.isPriceStreaming()
        return (
            <Header
                leftIcon='ios-menu'
                navigator={this.props.navigator}
                renderContent={this.renderContentHeader}
                firstChildStyles={
                    {
                        overflow: 'visible',
                        minHeight: 18,
                        borderBottomRightRadius: CommonStyle.borderBottomRightRadius
                    }
                }
                containerStyle={{
                    borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
                    overflow: 'hidden'
                }}
                rightStyles={{
                    height: '100%'
                }}

                renderLeftComp={this.renderLeftComp}
                style={{ paddingTop: 16 }}
            >
                <View />
            </Header>
        )
    }
    render() {
        return (
            <View>
                {this.renderHeaderSpecial()}
            </View>
        )
    }
}

export default HeaderWrapper
