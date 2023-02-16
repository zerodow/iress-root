import React, { Component } from 'react';
import {
  View, ListView, StyleSheet, Text
} from 'react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import CommonStyle from '~/theme/theme_controller'
import TransitionView from '~/component/animation_component/transition_view'
import ProgressBar from '~/modules/_global/ProgressBar';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import { checkPropsStateShouldUpdate, showContractDetail } from '~/lib/base/functionUtil'
import RowContract from './row_contract';
import I18n from '~/modules/language';
import * as Animatable from 'react-native-animatable'
import * as setTestId from '~/constants/testId';
const FAKE_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default class ContractNote extends Component {
  renderData() {
    if (!this.props.isConnected) return
    if (!this.props.isLoading && this.props.listData.length === 0) {
      return (
        <TransitionView
          {...setTestId.testProp(`Id_test_Cnote_Nodata`, `Label_test_Cnote_Nodata`)}
          index={2}
          animation='fadeIn'
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: CommonStyle.heightTabbar }}>
          <Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>
        </TransitionView>
      )
    }
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    }).cloneWithRows(this.props.listData)
    return (
      <ListView
        testID='FlatListRelatedNews'
        onEndReached={this.props.listData.length % 20 === 0 ? this.props.loadMore : () => null}
        onEndReachedThreshold={50}
        renderScrollComponent={props => <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />}
        keyboardShouldPersistTaps="always"
        enableEmptySections
        automaticallyAdjustContentInsets={false}
        dataSource={dataSource}
        initialListSize={20}
        pageSize={30}
        renderRow={this._renderRow.bind(this)}
        renderFooter={this._renderFooter.bind(this)}
        style={{ flex: 1, backgroundColor: 'transparent', padding: 16, paddingTop: 8 }}
      />
    )
  }

  _renderFooter() {
    return (
      <View style={{
        height: this.props.isLoadMore ? 148 : 108,
        alignItems: 'center'
      }}>
        {
          this.props.isLoadMore ? <View style={{ height: 48 }}>
            <ProgressBar />
          </View> : null
          // <ProgressBar />
        }
      </View>
    )
  }

  renderToLink = this.renderToLink.bind(this);
  renderToLink(data) {
    this.hideComponent()
    const cbSearch = () => {
      this.showComponent()
      this.props.getContractDataAfterBack && this.props.getContractDataAfterBack()
    }
    this.props.resetContractNote && this.props.resetContractNote()
    showContractDetail(data, this.props.navigator, this.props.isConnected, cbSearch);
  }

  _renderRow(rowData, rowID) {
    return (
      <RowContract setting={this.props.setting}
        index={rowID}
        key={`${rowData.cnotes_id}_${rowID}`}
        {...setTestId.testProp(`Id_test_${rowData.cnotes_id}_${rowID}`, `Label_test_${rowData.cnotes_id}_${rowID}`)}
        data={rowData}
        isLoading={this.props.isLoading}
        renderToLink={this.renderToLink} />
    );
  }

  _renderRowLoading({ animation, index }) {
    return (
      <TransitionView
        animation={animation}
        index={animation === 'fadeOut' ? null : parseInt(index)}
        style={CommonStyle.rowCnote}
      >
        <View style={{ flex: 3, justifyContent: 'center' }}>
          <TextLoad
            isLoading={true}
            allowFontScaling={false}
            style={{
              fontSize: CommonStyle.font15,
              fontWeight: '500',
              fontFamily: CommonStyle.fontPoppinsBold
            }}>{'ANZ.ASX Flag'}</TextLoad>
        </View>
        <ViewLoad
          isLoading={true}
          containerStyle={{
            width: 48,
            height: 20,
            borderRadius: 8
          }}
          forceStyle={{ alignSelf: 'center' }}
        ></ViewLoad>
        <View style={{ flex: 3, alignItems: 'flex-end', justifyContent: 'center' }}>
          <TextLoad allowFontScaling={false}
            isLoading={true}
            containerStyle={{ alignSelf: 'flex-end' }}
            style={{
              textAlign: 'right',
              fontFamily: CommonStyle.fontPoppinsRegular,
              color: CommonStyle.fontColor,
              fontSize: CommonStyle.font13,
              fontWeight: '300'
            }}>{+new Date()}</TextLoad>
        </View>
      </TransitionView>
    );
  }

  renderLoading(animation) {
    const data = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    }).cloneWithRows(FAKE_DATA)
    return (
      <ListView
        enableEmptySections
        automaticallyAdjustContentInsets={false}
        dataSource={data}
        renderRow={(rowData, sectionID, rowID) => this._renderRowLoading({ animation, index: rowID })}
        style={{ flex: 1, backgroundColor: CommonStyle.backgroundColorNews, padding: 16, paddingTop: 8 }}
      />
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['isLoading', 'listData', 'isLoadMore', { setting: ['lang', 'textFontSize'] }];
    const listState = [];
    const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  hideComponent() {
    this.view && this.view.fadeOut()
  }

  showComponent() {
    this.view && this.view.fadeIn()
  }

  render() {
    return (
      <Animatable.View
        ref={ref => this.view = ref}
        style={{ flex: 1 }}>
        <View style={StyleSheet.absoluteFillObject}>
          {this.props.isRefresh || (this.props.isLoading && this.renderLoading(this.props.isLoading ? 'fadeIn' : 'fadeOut'))}
        </View>
        {this.renderData()}
      </Animatable.View>
    )
  }
}
