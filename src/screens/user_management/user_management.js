import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Individual from '../individual/individual';
import Trust from '../trust/trust';
import Company from '../company/company';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import { dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

export default class UserMamagement extends Component {
  render() {
    return (
      <Tabs
        style={[{
          backgroundColor: '#ffffff'
        }]}
        test_id='Tabs'
        onChangeTab={(tabInfo) => {
          let id = '';
          switch (tabInfo.i) {
            case 0:
              id = 'individual_add';
              break;
            case 1:
              id = 'company_add';
              break;
            case 2:
              id = 'trust_add';
              break;
          }
          this.props.navigator.setButtons({
            rightButtons: [
              {
                title: 'Add',
                id: id,
                icon: iconsMap['ios-add-circle-outline']
              }
            ],
            animated: true
          })
        }}
        tabBarUnderlineStyle={{ height: dataStorage.platform === 'ios' ? 0 : 2, backgroundColor: 'white' }}
        renderTabBar={(...arg) => {
          return <ScrollableTabBar activeTab={1} activeTextColor='#FFF' renderTab={(name, page, isTabActive, onPressHandler, onLayoutHandler) => {
            if (dataStorage.platform === 'ios') {
              return (<TouchableOpacity test_id={'Tab' + page}
                key={page}
                onPress={() => onPressHandler(page)}
                onLayout={onLayoutHandler}
                style={{
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightColor: config.background.buttonGroupActive,
                  borderTopColor: config.background.buttonGroupActive,
                  borderTopWidth: 1,
                  borderBottomColor: config.background.buttonGroupActive,
                  borderBottomWidth: 1,
                  marginLeft: page === 0 ? 38 : 0,
                  marginRight: page === 2 ? 38 : 0,
                  borderLeftColor: config.background.buttonGroupActive,
                  backgroundColor: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup,
                  borderLeftWidth: page === 0 ? 1 : 0,
                  borderRightWidth: 1,
                  borderTopLeftRadius: page === 0 ? 4 : 0,
                  borderBottomLeftRadius: page === 0 ? 4 : 0,
                  borderTopRightRadius: page === 2 ? 4 : 0,
                  borderBottomRightRadius: page === 2 ? 4 : 0,
                  width: (width - 76) / 3
                }}>
                <Text style={{
                  color: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
                  height: 18,
                  fontFamily: 'HelveticaNeue',
                  fontSize: CommonStyle.font13,
                  fontWeight: '300',
                  lineHeight: 18.0,
                  letterSpacing: -0.06,
                  textAlign: 'center'
                }}>{name}</Text>
              </TouchableOpacity>);
            } else {
              return (<TouchableOpacity test_id={'Tab' + page}
                key={page}
                onPress={() => onPressHandler(page)}
                onLayout={onLayoutHandler}
                style={{
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: width / 3
                }}>
                <Text style={{
                  color: isTabActive ? '#ffffff' : '#b2ffffff',
                  fontSize: CommonStyle.fontSizeS,
                  fontFamily: CommonStyle.fontMedium,
                  textAlign: 'center'
                }}>{name.toUpperCase()}</Text>
              </TouchableOpacity>);
            }
          }} backgroundColor={config.background.buttonGroup} tabsContainerStyle={dataStorage.platform === 'ios' ? { height: 32, marginTop: 8 } : { height: 48 }} />
        }}>
        <View tabLabel={I18n.t('individual')} style={{ flex: 1, backgroundColor: '#FFF' }}>
          <Individual {...this.props} />
        </View>
        <View tabLabel={I18n.t('company')} style={{ flex: 1, backgroundColor: '#FFF' }}>
          <Company {...this.props} />
        </View>
        <View tabLabel={I18n.t('trust')} style={{ flex: 1, backgroundColor: '#FFF' }}>
          <Trust {...this.props} />
        </View>
      </Tabs>
    );
  }
}
