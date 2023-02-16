import { debounce } from 'lodash'
import React from 'react'

const withPreventDoubleClick = (WrappedComponent, delay = 500) => {
  class PreventDoubleClick extends React.PureComponent {
    debouncedOnPress = (e) => {
      this.props.onPress && this.props.onPress(e);
    }

    onPress = debounce(this.debouncedOnPress, delay, { leading: true, trailing: false });

    render() {
      return <WrappedComponent {...this.props} onPress={this.onPress} />;
    }
  }

  PreventDoubleClick.displayName = `withPreventDoubleClick(${WrappedComponent.displayName || WrappedComponent.name})`
  return PreventDoubleClick;
}

export default withPreventDoubleClick
