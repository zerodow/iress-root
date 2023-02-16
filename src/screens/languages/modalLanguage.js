import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DeviceInfo from 'react-native-device-info';
import { switchForm, logAndReport, logDevice, clone } from '../../lib/base/functionUtil';
import RowItem from './RowItem';
import { func, dataStorage } from '../../storage';
import Enum from '../../enum';
import * as Controller from '../../memory/controller';
import * as settingActions from '../../screens/setting/setting.actions'
import I18n from '../../modules/language';
import * as Util from '../../util';
import * as api from '../../api';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Modal from 'react-native-modal';

class ModalLanguage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    const defaultLang = this.props.setting.lang;
    this.state = {
      selected: defaultLang || Controller.getLang()
    }
  }

  async componentDidMount() {
    if (!Controller.getLoginStatus()) {
      this.setState({
        selected: await Controller.getLangGuest() || Util.choseLanguage()
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Controller.getLoginStatus()) {
      const lang = nextProps.setting.lang
      if (lang === this.state.selected) return;
      this.setState({
        selected: lang || Controller.getLang()
      }
      )
    }
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

  saveDataSetting(value) {
    try {
      const userId = func.getUserId();
      const newObj = clone(this.props.setting);
      const deviceId = dataStorage.deviceId;
      newObj['lang'] = value;
      Controller.setLang(value)
      newObj['deviceId'] = deviceId;
      this.props.actions.settingResponse(newObj);
      // save to db change from, to -> UTC
      const data = PureFunc.clone(newObj)
      const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesUTC(newObj['news'][`fromHour`], newObj['news'][`fromMinute`])
      const { hour: toHour, minute: toMinute } = Util.getHoursMinutesUTC(newObj['news'][`toHour`], newObj['news'][`toMinute`])
      data['news']['fromHour'] = fromHour
      data['news']['fromMinute'] = fromMinute
      data['news']['toHour'] = toHour
      data['news']['toMinute'] = toMinute
      data['deviceId'] = deviceId
      const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
      api.putData(urlPut, { data }).then(() => {
        logDevice('info', 'save to user setting success')
      }).catch(() => {
        logDevice('info', 'cannot save to user setting')
      })
    } catch (error) {
      logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
      logDevice('info', `onSelectLang setting exception: ${error}`);
    }
  }

  onSelectLang = (lang) => {
    this.setState({ selected: lang }, async () => {
      Controller.setLang(lang);
      Controller.dispatch(settingActions.setLang(lang));
      dataStorage.loginAsGuest ? await Controller.setLangGuest(lang) : this.saveDataSetting(lang)
      this.closeModalNew()
    });
  }

  closeModalNew() {
    this.props.navigator.dismissModal({
      animationType: 'none'
    })
  }

  render() {
    const { selected } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      >
        <View style={{ backgroundColor: CommonStyle.fontDefaultColor, marginLeft: 184, marginRight: 16, marginTop: 437, borderRadius: 8, borderWidth: 1 }}>
          <RowItem
            title={'English'}
            onPress={() => this.onSelectLang(Enum.LANG.EN)}
            selected={selected === Enum.LANG.EN}
          />
          <RowItem
            title={'中文'}
            onPress={() => this.onSelectLang(Enum.LANG.CN)}
            selected={selected === Enum.LANG.CN}
          />
          <RowItem
            title={'Tiếng Việt'}
            onPress={() => this.onSelectLang(Enum.LANG.VI)}
            selected={selected === Enum.LANG.VI}
          />
        </View>
      </View>
    )
  }
};

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: CommonStyle.backgroundColor,
      paddingHorizontal: 16,
      paddingTop: 1.5
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

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

export default connect(mapStateToProps, mapDispatchToProps)(ModalLanguage);
