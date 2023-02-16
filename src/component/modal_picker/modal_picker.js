import React, { Component } from 'react';
import { Text, View, Modal, ScrollView, PixelRatio } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export class ModalPicker extends Component {
  constructor(props) {
    super(props);
        this.listData = [];
    this.props.listItem.map((e, i) => {
      let obj = {};
      obj.value = e.toString();
      obj.onPress = this.selectItem.bind(this, e);
      this.listData.push(obj);
    })
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  selectItem(value) {
    this.props.onSelected(value);
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'back_picker_overview': {
          this.props.navigator.dismissModal({
            animated: true,
            animationType: 'slide-down'
          })
          break;
        }
        case 'menu_ios':
          this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true
          });
          break;
      }
    } else {
      switch (event.id) {
        case 'willAppear':
          break;
        case 'didAppear':
          break;
        case 'willDisappear':
          break;
        case 'didDisappear':
          break;
        default:
          break;
      }
    }
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <List style={{ borderWidth: 0 }}>
          {
            this.listData.map((item, i) => (
              <ListItem
                key={i}
                title={item.value}
                containerStyle={{ justifyContent: 'center', alignItems: 'center', borderBottomWidth: 0.5 }}
                titleStyle={[CommonStyle.textMainNormalNoColor, { color: this.props.selectedItem === item.value ? '#10a8b2' : 'black' }]}
                onPress={item.onPress}
                hideChevron={this.props.selectedItem !== item.value}
                rightIcon={{ name: 'md-checkmark', color: '#10a28b', type: 'ionicon', size: 24 }}
              />
            ))
          }
        </List>
      </ScrollView>
    );
  }
}

export default ModalPicker;
