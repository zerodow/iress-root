import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Platform, PixelRatio } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/logs';
import firebase from '../../firebase';
import { switchForm } from '../../lib/base/functionUtil';
import config from '../../config';
import { dataStorage } from '../../storage';

export class Logs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableSend: config.enableSend
    }
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

  componentDidMount() {
  }

  render() {
    return <View />
    // return (
    //   <LogView inverted={false} multiExpanded={true} timeStampFormat='HH:mm:ss'></LogView>
    // )
  }
}

export default Logs;
