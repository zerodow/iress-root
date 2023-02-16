import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/index'
import Icon from 'react-native-vector-icons/Ionicons';
import * as setTestId from '~/constants/testId';
export default class SearchBar extends Component {
  static defaultProps = {
    editable: true
  }

  constructor(props) {
    super(props)
    this.clear = this.clear.bind(this)
    this.blur = this.blur.bind(this)
    this.setText = this.setText.bind(this)
    this.state = {
      textSearch: props.textSearch || ''
    }
  }

  clear() {
    this.refInput && this.refInput.clear()
    this.setState({ textSearch: '' })
  }

  blur() {
    this.refInput && this.refInput.blur()
  }

  setText(textSearch) {
    this.setState({ textSearch })
  }

  render() {
    const {
      testID,
      onChangeText,
      onReset,
      style,
      editable = true,
      placeholder,
      setRefTextInput,
      onPress,
      isReal
    } = this.props
    return (
      <View testID={testID && 'search-bar-text-input'} style={[styles.searchBarContainerNoBorder, { backgroundColor: CommonStyle.ColorTabNews }, style]}>
        <View style={[styles.searchBarNoBorder, { backgroundColor: CommonStyle.backgroundNewSearchBar, borderRadius: 8, height: 42, overflow: 'hidden' }]}>
          <Icon testID='SearchIcon' name='ios-search' style={[styles.iconSearch]} />
          <TextInput
            ref={(ref) => {
              if (!isReal) return
              ref && setRefTextInput && setRefTextInput(ref)
              this.refInput = ref
            }}
            editable={editable && isReal}
            autoFocus={editable && isReal}
            // selectionColor={CommonStyle.fontColor}
            {...setTestId.testProp(`Id_test_SearchInput`, `Label_test_SearchInput`)}
            style={[styles.inputStyle, { lineHeight: Platform.OS === 'ios' ? 0 : 14 }]}
            underlineColorAndroid='transparent'
            returnKeyType="search"
            placeholder={placeholder || I18n.t('search')}
            placeholderTextColor={'rgba(255,255,255,0.5)'}
            onChangeText={(text) => {
              this.setState({ textSearch: text })
              onChangeText && onChangeText(text)
            }}
            value={this.state.textSearch}
          />
          {
            onPress ? <TouchableOpacity disabled={editable} onPress={onPress} style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 40,
              bottom: 0,
              backgroundColor: 'transparent'
            }} /> : null}
          <TouchableOpacity
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            activeOpacity={1}
            {...setTestId.testProp(`Id_test_searchInput_clear`, `Label_test_searchInput_clear`)}
            onPress={() => {
              this.clear()
              editable && this.refInput && this.refInput.focus()
              onReset && onReset()
            }}
          >
            <Icon
              {...setTestId.testProp(`Id_iconCancelSearchCode`, `Label_iconCancelSearchCode`)}
              name="ios-close-circle"
              style={CommonStyle.iconCloseLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    searchBar: {
      borderWidth: 1,
      borderColor: CommonStyle.backgroundNewSearchBar,
      height: 32,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      paddingRight: CommonStyle.paddingDistance2,
      paddingLeft: CommonStyle.paddingDistance2
    },

    searchBarNoBorder: {
      flex: 1,
      height: 32,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundColor,
      paddingRight: CommonStyle.paddingDistance2,
      paddingLeft: CommonStyle.paddingDistance2
    },
    iconSearch: {
      color: CommonStyle.searchPlaceHolderColor,
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingDistance2
    },
    searchPlaceHolder: {
      color: CommonStyle.searchPlaceHolderColor,
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily
    },

    searchPlaceHolder1: {
      color: CommonStyle.searchPlaceHolderColor,
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      opacity: 0.5
    },
    iconRight: {
      color: '#757575',
      fontSize: CommonStyle.fontSizeXXL,
      width: '10%',
      textAlign: 'right'
    },
    searchBarContractNotes: {
      height: 42,
      paddingLeft: 8,
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      borderRadius: 8,
      marginTop: 4,
      marginBottom: 4,
      justifyContent: 'center'
    },
    searchBar1: {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      paddingVertical: 8
    },
    searchBarContainer: {
      height: 44,
      paddingLeft: CommonStyle.paddingDistance2,
      paddingRight: CommonStyle.paddingDistance2,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: CommonStyle.fontShadow,
      backgroundColor: CommonStyle.statusBarBgColor,
      justifyContent: 'center'
    },
    iconCloseLight: {
      color: '#8e8e93',
      fontSize: CommonStyle.iconSizeS,
      backgroundColor: 'transparent'
    },
    searchBarContainerNoBorder: {
      borderRadius: 8,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.ColorTabNews,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
    },
    buttonCancel: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 16.5
    },
    inputStyle: {
      flex: 1,
      backgroundColor: 'transparent',
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      lineHeight: 12,
      height: 40
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
