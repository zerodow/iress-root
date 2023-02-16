import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { bindActionCreators } from 'redux';
import * as settingActions from '../../screens/setting/setting.actions'

import CommonStyle, { register, changeTheme } from '~/theme/theme_controller'
import { switchForm, logAndReport, logDevice, clone } from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller';
import * as Util from '../../util';
import * as api from '../../api';
import { func, dataStorage } from '../../storage';
import * as PureFunc from '~/utils/pure_func'
import Enum from '../../enum'
import RowItem from './RowItem';
import I18n from '../../modules/language';
const listSizes = Enum.FONT_SIZES;
class TextSizeSetting extends Component {
    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            switchForm(this.props.navigator, event)
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'menu_ios':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
            }
        }
    }
    handleSaveSettingToServer = (size) => {
        try {
            const userId = func.getUserId();
            const newObj = clone(this.props.setting);
            const deviceId = dataStorage.deviceId;
            newObj['textFontSize'] = size;
            newObj['deviceId'] = deviceId;

            const data = PureFunc.clone(newObj);
            const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesUTC(newObj['news']['fromHour'], newObj['news']['fromMinute']);
            const { hour: toHour, minute: toMinute } = Util.getHoursMinutesUTC(newObj['news']['fromHour'], newObj['news']['fromMinute']);
            data['news']['fromHour'] = fromHour;
            data['news']['fromMinute'] = fromMinute;
            data['news']['toHour'] = toHour;
            data['news']['toMinute'] = toMinute;
            data['deviceId'] = deviceId;

            const url = api.getUrlUserSettingByUserId(userId, 'put');
            api.putData(url, { data }).then(() => {
                logDevice('info', 'save to user setting success')
            }).catch(e => {
                logDevice('info', 'cannot save to user setting')
            })
        } catch (err) {
            logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
            logDevice('info', `onSelectLang setting exception: ${error}`);
        }
    }
    onChangeSize = async (key, size) => {
        try {
            console.log('size', size)
            Controller.setFontSize(size)
            dataStorage.currentTheme = await Controller.getThemeColor();
            changeTheme(dataStorage.currentTheme);
            // Save fontSize to ram memory
            Controller.dispatch(settingActions.setFontSize(size));
            // Save fontSize to local
            Controller.getLoginStatus() ? this.handleSaveSettingToServer(size) : Controller.setFontSizeOfGuest(size)
        } catch (error) {
            console.log('error', error)
            logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
        }
    };
    render() {
        const { setting: { textFontSize } } = this.props;
        return (
            <View style={CommonStyle.themeScreen}>
                {
                    listSizes.map((el, key) => (
                        <RowItem key={key} title={I18n.t(el.title)} isSelected={textFontSize === el.value} onPress={() => this.onChangeSize(key, el.value)} />
                    ))
                }
            </View>
        );
    }
}
function mapStateToProps(state) {
    return {
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(settingActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TextSizeSetting);
