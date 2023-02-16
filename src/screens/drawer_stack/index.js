import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { dataStorage } from '~/storage'

export default class DrawerStack extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.navigator.switchToTab({
      tabIndex: this.props.tabIndex
    });
  }

  render() {
    return <View />
  }
}

DrawerStack.defaultProps = {
  tabIndex: 0
}
