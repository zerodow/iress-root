import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { Icon } from '../Component/Icon';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import CustomIcon from '~/component/Icon';

const KEY_ENUM = {
    LINE: 'LINE',
    CANDLE: 'CANDLE'
};

export default class SettingChart extends PureComponent {
    onCancel() {
        Navigation.dismissModal({
            animated: false,
            animationType: 'none'
        });
    }

    onSelect = this.onSelect.bind(this);
    onSelect({ value }) {
        this.onCancel();
        this.props.onSelectChartType && this.props.onSelectChartType(value);
    }

    onSetting = this.onSetting.bind(this);
    onSetting() {
        const listNewsRepeat = [
            {
                value: KEY_ENUM.LINE,
                key: 'line'
            },
            {
                value: KEY_ENUM.CANDLE,
                key: 'candlestick'
            }
        ];
        Navigation.showModal({
            screen: 'equix.PickerBottom',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                statusBarColor: CommonStyle.statusBarColor,
                navBarHidden: true,
                statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                listItem: listNewsRepeat,
                title: I18n.t('chart_type'),
                textBtnCancel: I18n.t('cancel'),
                onCancel: this.onCancel,
                onSelect: this.onSelect,
                onPressBackdrop: this.onCancel,
                numberItem: 2
            }
        });
    }

    render() {
        return (
            <CustomIcon
                size={18}
                color={CommonStyle.fontSettingChart}
                style={{ paddingLeft: 16 }}
                onPress={this.onSetting}
                name="equix_setting"
            />
        );
    }
}
