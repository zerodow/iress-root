import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  UIManager
} from 'react-native';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import TabView from '~/component/tabview4/';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ExtraSvgIcon from '~/component/svg_icon/SvgIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import TextInputAvoidPadding from '~/component/text_input/index.js';
import * as FunctionUtil from '~/lib/base/functionUtil';
import * as PureFunc from '~/utils/pure_func';
import ListWL from './View/ListWL';
import ConfirmDelete from '~/component/confirm_delete/ConfirmDelete';
import ListUserWLDelete from './View/ListUserWLDelete';
import { dataStorage } from '~/storage';

import {
  getListUserWLChecked,
  syncActiveTab,
  destroy,
  getDicUserWLChecked
} from './Model/';
import { useShadow } from '~/component/shadow/SvgShadow';
import Shadow from '~/component/shadow';
import { isIphoneXorAbove } from '~/lib/base/functionUtil';
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
import { changeTextSearch } from '~s/orders/Model/OrdersModel';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const TABS = [
  {
    label: 'userWatchlist'
  },
  {
    label: 'iressMarket'
  }
];

const Title = (props) => {
  return (
    <View style={{}}>
      <Text
        style={{
          color: CommonStyle.fontColor,
          fontSize: CommonStyle.font23,
          fontFamily: CommonStyle.fontPoppinsBold
        }}
      >
        {I18n.t('watchlistCategories')}
      </Text>
    </View>
  );
};

const RightIcon = (props) => {
  const { navigator } = props;
  const onPress = () => {
    dataStorage.isReloading = false // off loading khi back ve screen watch list
    // dispatch(setManageButtonStatus(MANAGE_BUTTON_STATUS.MANAGE)) // reset manage button status to default
    navigator && navigator.pop();
  };
  return (
    <TouchableOpacity
      hitSlop={{
        top: 8,
        left: 8,
        bottom: 8,
        right: 8
      }}
      onPress={onPress}
    >
      <ExtraSvgIcon
        size={22}
        color={CommonStyle.fontColor}
        name={'nounCancel'}
      />
    </TouchableOpacity>
  );
};

const CloseIcon = (props) => {
  const { onPress } = props;
  return (
    <TouchableOpacityOpt
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50
      }}
    >
      <CommonStyle.icons.closeIcon
        color={CommonStyle.backgroundColor}
        style={{ textAlign: 'center' }}
        size={20}
      />
    </TouchableOpacityOpt>
  );
};

const ButtonConfirmDelete = (props) => {
  const isConnected = useSelector((state) => state.app.isConnected);
  const disabled = useMemo(() => {
    return !isConnected;
  }, [isConnected]);
  const isLoading = false;
  const titleButton = I18n.t('delete');
  const { onDelete } = props;
  return (
    <TouchableOpacityOpt
      onPress={onDelete}
      disabled={disabled}
      style={{
        backgroundColor: disabled
          ? CommonStyle.btnDisableBg
          : CommonStyle.color.sell,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 32,
        paddingTop: 22,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        {isLoading && <ActivityIndicator style={{ marginRight: 8 }} />}
        <Text
          style={{
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXL,
            color: CommonStyle.fontBlack,
            textAlign: 'center'
          }}
        >
          {titleButton}
        </Text>
      </View>
      <Ionicons name={'md-send'} size={26} />
    </TouchableOpacityOpt>
  );
};

const Header = (props) => {
  const [Shadow, onLayout] = useShadow();
  return (
    <View
      style={{
        backgroundColor: CommonStyle.color.dark
      }}
    >
      <Shadow />
      <View
        onLayout={onLayout}
        style={{
          zIndex: 10,
          width: '100%',
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: isIphoneXorAbove()
            ? 46
            : Platform.OS === 'ios'
              ? 32
              : 16,
          paddingBottom: 16
        }}
      >
        <Title />
        <RightIcon {...props} />
      </View>
    </View>
  );
};

export const SearchBar = React.forwardRef((props, ref) => {
  const {
    searchWrapperStyles,
    placeholder,
    wrapperStyle,
    onChangeText,
    isHideShadow = false
  } = props;
  const { searchWrapper, iconLeft, textInput } = styles;
  let Shadow = View;
  let onLayout = () => { };
  if (!isHideShadow) {
    [Shadow, onLayout] = useShadow();
  }
  const dic = useRef({});
  const inputRef = useRef({});
  const setRefTextInput = (ref) => {
    if (ref) {
      dic.current.refTextInput = ref;
    }
  };
  const blur = () => {
    inputRef.current && inputRef.current.blur && inputRef.current.blur();
  };

  const focus = () => {
    inputRef.current && inputRef.current.focus && inputRef.current.focus();
  };

  const clearText = () => {
    changeTextSearch('');
    inputRef.current && inputRef.current.clear && inputRef.current.clear();
  };
  useImperativeHandle(ref, () => {
    return {
      blur,
      focus,
      clearText
    };
  });
  return (
    <View style={{ backgroundColor: CommonStyle.color.dark }}>
      <Shadow />
      <View
        onLayout={onLayout}
        style={[
          {
            zIndex: 10,
            width: '100%',
            paddingTop: 8,
            paddingBottom: 8
          },
          wrapperStyle
        ]}
      >
        <View style={[searchWrapper, searchWrapperStyles]}>
          <CommonStyle.icons.search
            name={'search'}
            size={17}
            color={CommonStyle.fontColor}
            style={[iconLeft, { marginLeft: 8, marginRight: 8 }]}
          />
          <TextInputAvoidPadding
            style={textInput}
            ref={setRefTextInput}
            forwardRef={inputRef}
            placeholder={placeholder || I18n.t('search')}
            placeholderTextColor={
              CommonStyle.searchPlaceHolderColor
            }
            onChangeText={onChangeText}
            underlineColorAndroid="transparent"
            autoFocus={false}
            // selectionColor={CommonStyle.fontColor}
          />
        </View>
      </View>
    </View>
  );
});

const NetworkWarning = (props) => {
  const isConnectedRedux = useSelector((state) => state.app.isConnected);
  const [isConnected, setIsConnected] = useState(isConnectedRedux);
  useEffect(() => {
    if (isConnectedRedux !== isConnected) {
      LayoutAnimation.easeInEaseOut();
      setIsConnected(isConnectedRedux);
    }
  }, [isConnectedRedux, isConnected]);
  return isConnected ? (
    <View />
  ) : (
    <View
      style={{
        width: '100%',
        backgroundColor: CommonStyle.color.sell,
        paddingVertical: 8
      }}
    >
      <Text
        style={{
          fontFamily: CommonStyle.fontPoppinsRegular,
          fontSize: CommonStyle.font11,
          color: CommonStyle.fontBlack,
          textAlign: 'center'
        }}
      >
        {I18n.t('connectingFirstCapitalize')}
      </Text>
    </View>
  );
};

const Content = ({ navigator, showDelete, priceBoardSelected }) => {
  const [Shadow, onLayout] = useShadow();
  const [activeTab, setActiveTab] = useState(0);
  const [textSearch, setTextSearch] = useState('');
  const dic = useRef({ timeoutChangeText: null });
  const onChangeTabTabView = useCallback((activeTab) => {
    syncActiveTab(activeTab);
    setActiveTab(activeTab);
  }, []);
  const onChangeText = useCallback((textSearch) => {
    dic.current.timeoutChangeText &&
      clearTimeout(dic.current.timeoutChangeText);
    dic.current.timeoutChangeText = setTimeout(() => {
      setTextSearch(textSearch);
    }, 300);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: CommonStyle.color.dark }}>
      <View>
        <Shadow />
        <View onLayout={onLayout} style={{ zIndex: 10 }}>
          <TabView
            tabs={TABS}
            activeTab={activeTab}
            onChangeTab={onChangeTabTabView}
            wrapperStyle={{
              backgroundColor: CommonStyle.color.dark,
              justifyContent: 'space-around',
              zIndex: 9
            }}
          />
        </View>
      </View>
      <View style={{ height: 5 }} />
      <SearchBar onChangeText={onChangeText} />
      <View style={{ height: 5 }} />
      <NetworkWarning />
      <ListWL
        showDelete={showDelete}
        navigator={navigator}
        activeTab={activeTab}
        priceBoardSelected={priceBoardSelected}
        textSearch={textSearch}
      />
    </View>
  );
};

const ConfirmDeleteHeader = (props) => {
  const { hideDelete } = props;
  const [ShadowBottom, onLayout] = useShadow();
  return (
    <View>
      <Shadow heightShadow={40} />
      <ShadowBottom />
      <View
        onLayout={onLayout}
        style={{
          zIndex: 10,
          width: '100%',
          height: 39,
          backgroundColor: CommonStyle.color.dark,
          paddingVertical: 8,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}
      >
        <Text
          style={{
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.font15,
            color: CommonStyle.fontColor,
            textAlign: 'center'
          }}
        >
          {I18n.t('deleteWatchlist')}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'flex-end'
          }}
        >
          <CloseIcon onPress={hideDelete} />
        </View>
      </View>
      <View
        style={{
          height: 5,
          width: '100%',
          backgroundColor: CommonStyle.color.dark
        }}
      />
    </View>
  );
};

const ConfirmDeleteContent = React.forwardRef((props, ref) => {
  const [listUserWLDelete, setListUserWLDelete] = useState(
    getListUserWLChecked()
  );
  const priceBoard = useSelector((state) => state.watchlist3.priceBoard);
  useImperativeHandle(ref, () => {
    return {
      syncUserWLDelete
    };
  });
  const listData = useMemo(() => {
    if (listUserWLDelete.length === 1) {
      // Delete 1 userWL => show all user WL symbol
      const watchlist = listUserWLDelete[0];
      const { value = [] } = priceBoard[watchlist] || {};
      const listSymbol = [];
      for (let i = 0; i < value.length; i++) {
        const { symbol, exchange } = value[i];
        listSymbol.push(`${symbol}.${exchange}`);
      }
      return listSymbol;
    } else {
      // Delete more 1 userWL => show all user WL delete
      const listUserWL = [];
      for (let i = 0; i < listUserWLDelete.length; i++) {
        const watchlist = listUserWLDelete[i];
        const { watchlist_name: WLName } = priceBoard[watchlist] || {};
        listUserWL.push(WLName);
      }
      return listUserWL;
    }
  }, [listUserWLDelete, priceBoard]);
  const syncUserWLDelete = () => {
    setListUserWLDelete(getListUserWLChecked());
  };
  const renderContentText = useCallback(() => {
    if (listUserWLDelete.length === 1) {
      // Delete 1 userWL
      const watchlist = listUserWLDelete[0];
      const { watchlist_name: WLName } = priceBoard[watchlist] || {};
      return (
        <Text
          style={{
            flexDirection: 'row',
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor,
            textAlign: 'center',
            paddingBottom: 8
          }}
        >
          <Text>{`Are you sure you wish to delete watchlist "`}</Text>
          <Text style={{ color: CommonStyle.color.modify }}>
            {WLName}
          </Text>
          <Text>{`" and all items inside?`}</Text>
        </Text>
      );
    } else {
      // Delete more 1 userWL
      return (
        <Text
          style={{
            flexDirection: 'row',
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor,
            textAlign: 'center',
            paddingBottom: 8
          }}
        >
          {`Are you sure you wish to delete these watchlists and all items inside?`}
        </Text>
      );
    }
  }, [listUserWLDelete, priceBoard]);
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: CommonStyle.backgroundColor,
        paddingHorizontal: 8
      }}
    >
      {renderContentText()}
      <ListUserWLDelete
        textStyle={{
          color:
            listUserWLDelete.length === 1
              ? CommonStyle.fontColor
              : CommonStyle.color.modify
        }}
        listData={listData}
      />
    </View>
  );
});

const ConfirmDeleteFooter = ({ hideDelete }) => {
  const dispatch = useDispatch();

  const onDelete = () => {
    const dicUserWLChecked = getDicUserWLChecked();
    _.forEach(dicUserWLChecked, (value, watchlist) =>
      dispatch.priceBoard.deletePriceBoard({ watchlist })
    );

    destroy();
    hideDelete && hideDelete();
  };

  return (
    <View
      style={{
        backgroundColor: CommonStyle.backgroundColor
      }}
    >
      <ButtonConfirmDelete onDelete={onDelete} />
    </View>
  );
};

const Categories = ({ navigator, priceBoardSelected }) => {
  const refConfirmDelete = useRef({});
  const refConfirmDeleteContent = useRef({});
  const showDelete = useCallback(() => {
    refConfirmDeleteContent.current.syncUserWLDelete &&
      refConfirmDeleteContent.current.syncUserWLDelete(); // Sync dicUseWLChecked
    refConfirmDelete.current.show && refConfirmDelete.current.show();
  }, []);
  const hideDelete = useCallback(() => {
    refConfirmDelete.current.hide && refConfirmDelete.current.hide();
  }, []);
  const renderHeader = () => <ConfirmDeleteHeader hideDelete={hideDelete} />;
  const renderContent = () => (
    <ConfirmDeleteContent ref={refConfirmDeleteContent} />
  );
  const renderFooter = () => <ConfirmDeleteFooter hideDelete={hideDelete} />;
  useEffect(() => {
    return () => {
      destroy(); // clear data trong categories model
      console.log('Categories unmount');
    };
  }, []);
  return (
    <KeyboardAvoidView>
      <View
        onStartShouldSetResponder={Keyboard.dismiss}
        style={{ flex: 1, backgroundColor: CommonStyle.color.dark }}
      >
        <Header navigator={navigator} />
        <View style={{ height: 5 }} />
        <Content
          navigator={navigator}
          priceBoardSelected={priceBoardSelected}
          showDelete={showDelete}
        />
        {/* <ConfirmDelete
					ref={refConfirmDelete}
					renderHeader={renderHeader}
					renderContent={renderContent}
					renderFooter={renderFooter}
				/> */}
      </View>
    </KeyboardAvoidView>
  );
};

const styles = {};

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      paddingTop:
        Platform.OS === 'ios'
          ? FunctionUtil.isIphoneXorAbove()
            ? 38
            : 16
          : 0,
      marginTop: 16,
      height:
        Platform.OS === 'ios'
          ? FunctionUtil.isIphoneXorAbove()
            ? 48 + 38
            : 64
          : 48,
      marginLeft: 32,
      marginRight: 16,
      marginBottom: 8
    },
    title: {
      fontFamily: CommonStyle.fontPoppinsBold,
      fontSize: CommonStyle.fontSizeXXL,
      color: CommonStyle.navigatorSpecial.navBarSubtitleColor
      // width: width * 0.7
    },
    searchWrapper: {
      flexDirection: 'row',
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      borderRadius: 8,
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      marginHorizontal: 8
    },
    textInput: {
      width: '100%',
      color: CommonStyle.fontColor,
      fontFamily: CommonStyle.fontPoppinsRegular,
      fontSize: CommonStyle.fontSizeXS1,
      padding: 0,
      margin: 0
    },
    buttonCancel: {
      justifyContent: 'center',
      flex: 1,
      marginLeft: 16
    },
    textCancel: {
      textAlign: 'center',
      color: CommonStyle.fontColor,
      fontFamily: CommonStyle.fontPoppinsBold,
      fontSize: CommonStyle.fontSizeS
    },
    iconLeft: {
      color: CommonStyle.fontColor,
      marginLeft: 8,
      marginRight: 16,
      fontSize: CommonStyle.iconSizeS
    },
    iconRight: {}
  });

  PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default Categories;
