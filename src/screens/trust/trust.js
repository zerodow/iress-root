import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
import Trustee from './trustee';
const { width, height } = Dimensions.get('window');

export default class Trust extends Component {
  render() {
    return (
      <Tabs
        style={{ backgroundColor: config.background.screen }}
        tabBarUnderlineStyle={{ height: 0, borderColor: 0 }}
        renderTabBar={(...arg) => {
          return <ScrollableTabBar style={{ height: dataStorage.platform === 'ios' ? 30 : 40, marginTop: 8, marginBottom: 4, backgroundColor: config.background.screen, borderBottomWidth: 0 }} activeTab={1}
            activeTextColor='#FFF'
            renderTab={(name, page, isTabActive, onPressHandler, onLayoutHandler) => {
              if (dataStorage.platform === 'ios') {
                return (<TouchableOpacity test_id={'Tab' + page}
                  key={page}
                  onPress={() => onPressHandler(page)}
                  onLayout={onLayoutHandler}
                  style={{
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRightColor: config.background.buttonGroup,
                    borderTopColor: config.background.buttonGroup,
                    borderTopWidth: 1,
                    borderBottomColor: config.background.buttonGroup,
                    borderBottomWidth: 1,
                    marginLeft: page === 0 ? 16 : 0,
                    marginRight: page === 1 ? 16 : 0,
                    borderLeftColor: config.background.buttonGroup,
                    backgroundColor: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
                    borderLeftWidth: page === 0 ? 1 : 0,
                    borderRightWidth: 1,
                    borderTopLeftRadius: page === 0 ? 4 : 0,
                    borderBottomLeftRadius: page === 0 ? 4 : 0,
                    borderTopRightRadius: page === 1 ? 4 : 0,
                    borderBottomRightRadius: page === 1 ? 4 : 0,
                    width: (width - 32) / 2
                  }}>
                  <Text style={{
                    color: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup, height: 18, fontFamily: 'HelveticaNeue', fontSize: CommonStyle.font13, fontWeight: '300', lineHeight: 18.0, letterSpacing: -0.06, textAlign: 'center'
                  }}>{name}</Text>
                </TouchableOpacity>);
              } else {
                return (
                  <TouchableOpacity test_id={'Tab' + page}
                    key={page}
                    onPress={() => onPressHandler(page)}
                    onLayout={onLayoutHandler}
                    style={{
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: page === 0 ? 36 : 0,
                      marginRight: page === 1 ? 36 : 0,
                      backgroundColor: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
                      borderTopLeftRadius: page === 0 ? 4 : 0,
                      borderBottomLeftRadius: page === 0 ? 4 : 0,
                      borderTopRightRadius: page === 1 ? 4 : 0,
                      borderBottomRightRadius: page === 1 ? 4 : 0,
                      width: (width - 72) / 2,
                      elevation: 5,
                      transform: [
                        {
                          translateX: 3
                        },
                        {
                          translateY: 3
                        }
                      ]
                    }}>
                    <Text style={{
                      color: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup, height: 18, fontFamily: 'HelveticaNeue', fontSize: CommonStyle.font13, fontWeight: '300', lineHeight: 18.0, letterSpacing: -0.06, textAlign: 'center'
                    }}>{name}</Text>
                  </TouchableOpacity>
                );
              }
            }}
            backgroundColor={config.background.buttonGroupActive} tabsContainerStyle={{ height: dataStorage.platform === 'ios' ? 30 : 40 }} />
        }}>
        <View tabLabel='IndividualTrustee' style={{ flex: 1, backgroundColor: '#FFF' }}>
          <Trustee {...this.props} type='individual_trustee' />
        </View>
        <View tabLabel='CompanyTrustee' style={{ flex: 1, backgroundColor: '#FFF' }}>
          <Trustee {...this.props} type='company_trustee' />
        </View>
      </Tabs>
    );
  }
}
