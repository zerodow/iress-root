import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    Platform, Image, ScrollView
} from 'react-native'
import Animated, { Easing } from 'react-native-reanimated';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as loginActions from '../../screens/login/login.actions'
import CommonStyle, { register } from '~/theme/theme_controller'
import IconIcons from 'react-native-vector-icons/MaterialIcons';
import I18n from '../../modules/language/';
import logoEquix from '../../img/banner-whatsnew.png';
import { logAndReport } from '../../lib/base/functionUtil';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from '~/component/Icon'
import { SvgCss } from 'react-native-svg'
import config from '~/config'
import ENUM from '~/enum'
import Highlighter from 'react-native-highlight-words';
const { SUB_ENVIRONMENT } = ENUM
const listItem = ['New1', 'New2'];

class WhatsNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: true
        }
        this.opacityWrapperAnim = new Animated.Value(0)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }

    drawSvgIconNoBug() {
        const xml = `<svg height="41px" width="41px" fill="#57e1f1" viewBox="0 0 100 100">
        <path d="M80.716 19.294C72.514 11.093 61.609 6.576 50.01 6.576s-22.503 4.517-30.705 12.719C11.104 27.496 6.586 38.4 6.586 50c0 11.599 4.517 22.503 12.719 30.705 8.201 8.202 19.106 12.719 30.705 12.719 11.6 0 22.504-4.517 30.705-12.719 16.931-16.931 16.931-44.478.001-61.411zm-30.705 68.13c-9.997 0-19.395-3.893-26.463-10.961C9.671 62.586 9.001 40.438 21.519 25.751l10.093 10.093c.206 1.09.596 2.412 1.253 4.043a9.547 9.547 0 003.818 1.386c-1.304 1.716-2.07 3.889-2.07 6.547 0 1.258.171 2.949.487 4.888-1.591.2-3.25.698-4.829 1.703-2.54 6.304-1.804 8.817-.987 10.452 0 0-2.358 1.957-3.507 2.418 1.468-.09 4.546-1.687 4.546-1.687s-.613-7.048 1.736-10.316c1.204.183 2.435.341 3.614.479.924 4.349 2.409 9.371 4.276 13.615-1.367.098-2.826.468-4.204 1.345-1.924 4.773-1.366 6.678-.748 7.915 0 0-1.786 1.482-2.656 1.83 1.112-.067 3.442-1.275 3.442-1.275s-.465-5.337 1.315-7.813c1.371.207 2.789.375 4.048.505 2.105 4.029 4.587 6.882 7.246 6.882.483 0 .935-.146 1.358-.406V53.984l.517.516v23.854c.423.26.875.406 1.359.406 2.658 0 5.141-2.853 7.246-6.882a89.226 89.226 0 004.049-.505c1.777 2.476 1.314 7.813 1.314 7.813s2.33 1.208 3.441 1.275c-.871-.348-2.656-1.83-2.656-1.83.619-1.237 1.176-3.142-.748-7.915-1.377-.877-2.836-1.247-4.203-1.345.511-1.16.989-2.382 1.439-3.629l12.751 12.751c-6.76 5.775-15.259 8.931-24.248 8.931zm19.697-21.969l-6.194-6.194c.313-1.196.593-2.374.833-3.505 1.18-.138 2.412-.296 3.615-.479 2.164 3.013 1.814 9.221 1.746 10.178zm-9.557-26.944c-2.346-1.346-5.303-2.02-8.523-2.02-.484 0-.936.146-1.359.405v9.119l-.517-.515v-8.604a2.572 2.572 0 00-1.358-.405c-2.374 0-4.602.369-6.55 1.101l-.303-.304c1.911-.751 4.135-1.175 6.631-1.198.075 0 .146-.008.222-.008.565 0 1.107.174 1.617.498.511-.324 1.052-.498 1.618-.498.074 0 .146.008.221.008 3.648.033 6.811.901 9.217 2.51l-.916-.089zm-26.476-.605l1.192 1.192c-.176.025-.354.047-.529.073a5.67 5.67 0 01-.663-1.265zm44.827 36.343l-8.505-8.505c.808.4 3.055 1.463 4.246 1.536-1.148-.461-3.508-2.418-3.508-2.418.818-1.635 1.553-4.148-.986-10.452-1.578-1.005-3.238-1.503-4.828-1.703.314-1.938.486-3.63.486-4.888 0-2.658-.766-4.831-2.07-6.548a9.53 9.53 0 003.818-1.385c2.092-5.191 1.484-7.261.813-8.606 0 0 1.941-1.612 2.887-1.992-1.209.074-3.742 1.388-3.742 1.388s.506 5.804-1.43 8.496a91.75 91.75 0 00-3.83-.488v-.627c0-3.61-1.293-8.171-4.902-8.171h-5.102v-.409h4.768l-.34-1.271h2.465v-.029l.16.082 2.137-4.126c.012.001.025.005.039.005.637 0 1.398-.661 1.938-1.683.578-1.096.76-2.418-.012-2.826-.656-.349-1.676.333-2.338 1.586-.465.883-.664 1.905-.324 2.485l-1.91 3.688H56.06l-.037-.136a.816.816 0 00-.816-.817H51.85v-.409h3.049c.002-.057.016-.111.016-.169a2.659 2.659 0 00-2.655-2.656c-.14 0-.275.014-.409.035v-1.465a1.837 1.837 0 10-3.676 0v1.465a2.624 2.624 0 00-.409-.035 2.659 2.659 0 00-2.656 2.656c0 .058.014.112.017.169h3.047v.409h-3.355a.817.817 0 00-.817.817l-.037.136H41.59l-1.909-3.687c.34-.58.141-1.602-.325-2.485-.661-1.253-1.676-1.935-2.338-1.586-.771.407-.589 1.729-.011 2.826.54 1.022 1.3 1.683 1.938 1.683.014 0 .026-.004.04-.004l2.136 4.124.159-.082v.029h2.466l-.339 1.271h4.766v.409h-5.101c-2.275 0-3.625 2.136-4.315 4.618L25.759 21.507c6.763-5.774 15.262-8.931 24.251-8.931 9.997 0 19.394 3.893 26.463 10.961 13.877 13.877 14.546 36.025 2.029 50.712z" />
      </svg>`
        return <SvgCss xml={xml} />
    }

    drawSvgIconPerformance() {
        const xml = `<svg height="41px" width="41px" fill="#1ce1f1" viewBox="0 0 64 64">
        <style>
          {
            ".prefix__st2{fill:none;stroke:#1ce1f1;stroke-width:.1;stroke-miterlimit:10}"
          }
        </style>
        <path d="M62 62H2v-6h60v6zM4 60h56v-2H4v2zM61 54H51V20.5l2.7-1.3 2.3 4.9 5-7.2V54zm-8-2h6V23.4l-3.3 4.8-2.7-5.7V52zM49 54H39V26.2l10-4.7V54zm-8-2h6V24.6l-6 2.8V52zM37 54H27V31.8l10-4.7V54zm-8-2h6V30.3l-6 2.8V52zM25 54H15V22.6l4.4-2.4L24.3 33l.6-.3V54h.1zm-8-2h6V35.1l-4.6-12-1.4.7V52zM13 54H3V29l10-5.4V54zm-8-2h6V27l-6 3.2V52z" />
        <path d="M52.1 11.2l1.7 3.6-27.3 12.8-5-13L2 25v2.3l18.5-9.9 5 13 29.1-13.8 1.7 3.6L62 12z" />
      </svg>`
        return <SvgCss xml={xml} />
    }

    fadeInAnim = this.fadeInAnim.bind(this)
    fadeInAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 1,
                duration: 500,
                easing: Easing.linear
            }
        ).start()
    }

    fadeOutAnim = this.fadeOutAnim.bind(this)
    fadeOutAnim() {
        Animated.timing(
            this.opacityWrapperAnim,
            {
                toValue: 0,
                duration: 500,
                easing: Easing.linear
            }
        ).start()
    }

    showModal() {
        this.setState({
            isModalVisible: true
        })
    }
    hideModal() {
        this.fadeOutAnim()
        setTimeout(() => {
            if (this.props.closeModal) {
                this.props.closeModal()
            } else {
                this.props.navigator && this.props.navigator.dismissModal()
            }
        }, 500)
    }
    componentDidMount() {
        // this.props.onRef && this.props.onRef(this)
        // this.props.isShow && this.showModal();
        this.fadeInAnim()
    }
    componentWillUnmount() {
        // this.props.onRef && this.props.onRef(undefined)
    }
    getIcon(state) {
        try {
            switch (state) {
                case 'New1':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 30 }}>
                        <IconIcons name='search' size={30} color={CommonStyle.color.modify} />
                    </View>
                    break;
                case 'New2':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 30 }}>
                        <MaterialCommunityIcons name='check-circle-outline' size={30} color={CommonStyle.color.modify} />
                    </View>
                    break;
                case 'New3':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 24 }}>
                        <Icon name='equix_portfolio' size={20} color={CommonStyle.color.modify} />
                    </View>
                    break;
                case 'New4':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 24 }}>
                        <MaterialCommunityIcons name='volume-high' size={24} color={CommonStyle.color.modify} />
                    </View>
                    break;
            }
        } catch (error) {
            console.log('getIcon whatsNew logAndReport exception: ', error)
            logAndReport('getIcon whatsNew exception', error, 'getIcon whatsNew');
        }
    }

    getIconCustom = this.getIconCustom.bind(this)
    getIconCustom(state) {
        try {
            switch (state) {
                case 'New1':
                    return <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        {this.drawSvgIconPerformance()}
                    </View>
                    break;
                case 'New2':
                    return <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        {this.drawSvgIconNoBug()}
                    </View>
                    break;
                case 'New3':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 24 }}>
                        <Icon name='equix_portfolio' size={20} color={CommonStyle.color.modify} />
                    </View>
                    break;
                case 'New4':
                    return <View style={{ justifyContent: 'center', alignItems: 'center', width: 24 }}>
                        <MaterialCommunityIcons name='volume-high' size={24} color={CommonStyle.color.modify} />
                    </View>
                    break;
            }
        } catch (error) {
            console.log('getIcon whatsNew logAndReport exception: ', error)
            logAndReport('getIcon whatsNew exception', error, 'getIcon whatsNew');
        }
    }
    getTitle(state) {
        switch (state) {
            case 'New1':
                return I18n.t('whatsNew1Title', { locale: this.props.setting.lang })
            case 'New2':
                return I18n.t('whatsNew2Title', { locale: this.props.setting.lang })
            case 'New3':
                return I18n.t('whatsNew3Title', { locale: this.props.setting.lang })
            case 'New4':
                return I18n.t('whatsNew4Title', { locale: this.props.setting.lang })
            case 'New5':
                return I18n.t('whatsNew5Title', { locale: this.props.setting.lang })
        }
    }
    getContent(state) {
        switch (state) {
            case 'New1':
                return I18n.t('whatsNew1Content', { locale: this.props.setting.lang })
            case 'New2':
                return I18n.t('whatsNew2Content', { locale: this.props.setting.lang })
            case 'New3':
                return I18n.t('whatsNew3Content', { locale: this.props.setting.lang })
            case 'New4':
                return I18n.t('whatsNew4Content', { locale: this.props.setting.lang })
            case 'New5':
                return I18n.t('whatsNew5Content', { locale: this.props.setting.lang })
        }
    }

    renderWhatsNewContentCustom = this.renderWhatsNewContentCustom.bind(this)
    renderWhatsNewContentCustom(item, index) {
        const textHighlight = `100+`
        const title = this.getTitle(item)
        const content = this.getContent(item)
        return <View key={item} style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: index === 0 ? 24 : 16, marginBottom: 8, alignItems: 'center' }}>
            {this.getIconCustom(item)}
            <View style={{ flex: 1, justifyContent: 'center', paddingTop: index === 0 ? 10 : 8 }}>
                {
                    index === 1
                        ? <Highlighter
                            highlightStyle={{ fontFamily: CommonStyle.fontPoppinsBold, textDecorationLine: 'underline' }}
                            searchWords={[textHighlight]}
                            textToHighlight={title}
                            style={[CommonStyle.textHeaderWhatsNew, { marginLeft: 14, marginRight: 16, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsMedium, fontSize: CommonStyle.fontSizeS }]}
                            autoEscape={true}
                        />
                        : <Text style={[CommonStyle.textHeaderWhatsNew, { marginLeft: 14, marginRight: 16, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsMedium, fontSize: CommonStyle.fontSizeS }]} numberOfLines={2} >{title}</Text>

                }
                {
                    content
                        ? <Text style={[CommonStyle.textWhatsNew, { marginLeft: 14, marginRight: 20, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeXS }]} >{content}</Text>
                        : null
                }
            </View>
        </View>
    }

    renderWhatsNewContent = this.renderWhatsNewContent.bind(this)
    renderWhatsNewContent(item, index) {
        if (config.subEnvironment === SUB_ENVIRONMENT.PRODUCT) {
            return this.renderWhatsNewContentCustom(item, index)
        }
        return Platform.OS === 'ios'
            ? this.renderWhatsNewContentIOS(item, index)
            : this.renderWhatsNewContentAndroid(item, index)
    }

    renderWhatsNewContentIOS = this.renderWhatsNewContentIOS.bind(this)
    renderWhatsNewContentIOS(item, index) {
        const content = this.getContent(item)
        return <View key={item} style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: index === 0 ? 16 : 8, marginBottom: 8, alignItems: 'center' }}>
            {this.getIcon(item)}
            <View>
                <Text style={[CommonStyle.textHeaderWhatsNew, { marginLeft: 14, marginRight: 16, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsMedium, fontSize: CommonStyle.fontSizeS, fontWeight: '500' }]} numberOfLines={2} >{this.getTitle(item)}</Text>
                {
                    content
                        ? <Text style={[CommonStyle.textWhatsNew, { marginLeft: 14, marginRight: 20, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeXS }]} >{content}</Text>
                        : null
                }
            </View>
        </View>
    }

    renderWhatsNewContentAndroid = this.renderWhatsNewContentAndroid.bind(this)
    renderWhatsNewContentAndroid(item, index) {
        const content = this.getContent(item)
        return <View key={item} style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: index === 0 ? 16 : 8, marginBottom: 8, alignItems: 'center' }}>
            {
                this.getIcon(item)
            }
            <View>
                <Text style={[CommonStyle.textHeaderWhatsNew, { marginLeft: 14, marginRight: 16, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsMedium, fontSize: CommonStyle.fontSizeS, fontWeight: '500' }]} numberOfLines={2} >{this.getTitle(item)}</Text>
                {
                    content
                        ? <Text style={[CommonStyle.textWhatsNew, { marginLeft: 14, marginRight: 20, opacity: 0.87, lineHeight: 18, fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeS - 3 }]} >{content}</Text>
                        : null
                }
            </View>
        </View>
    }

    render() {
        return (
            <Animated.View style={{
                opacity: this.opacityWrapperAnim,
                backgroundColor: CommonStyle.backgroundColorPopup,
                flex: 1
            }}>
                {
                    Platform.OS === 'ios'
                        ? <View blurType="xlight" style={{ backgroundColor: CommonStyle.backgroundColor, borderRadius: 20, position: 'absolute', top: 88, right: 40, bottom: 128, left: 40 }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 16 }}>
                                <Text style={{ fontSize: CommonStyle.fontSizeM, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsMedium, fontWeight: '500' }}>{I18n.t('whatsNew')}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                                <Image style={{
                                    width: '100%',
                                    height: 80
                                }} source={logoEquix} />
                            </View>
                            <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                                <ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    style={{ flex: 1 }}>
                                    {listItem.map(this.renderWhatsNewContent)}
                                </ScrollView>
                            </View>
                            <View style={CommonStyle.colorWhatsNew}>
                                <TouchableOpacity
                                    onPress={this.hideModal}
                                    style={{ width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                                    <Text style={[CommonStyle.textMainNormal, { color: CommonStyle.color.modify, fontSize: CommonStyle.fontSizeM }]}>{I18n.t('dismiss', { locale: this.props.setting.lang })}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        : <View style={{ backgroundColor: CommonStyle.backgroundColor, borderRadius: 20, position: 'absolute', top: 88, right: 40, bottom: 128, left: 40 }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 16 }}>
                                <Text style={{ fontSize: CommonStyle.fontSizeM, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsMedium, fontWeight: '500' }}>{I18n.t('whatsNew')}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                                <Image style={{
                                    width: '100%',
                                    height: 80
                                }} source={logoEquix} />
                            </View>
                            <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                                <ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    style={{ flex: 1 }}>
                                    {listItem.map(this.renderWhatsNewContent)}
                                </ScrollView>
                            </View>
                            <View style={CommonStyle.colorWhatsNew}>
                                <TouchableOpacity
                                    onPress={() => this.hideModal()}
                                    style={{ width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                                    <Text style={[CommonStyle.textMainNormal, { color: CommonStyle.color.modify, fontSize: CommonStyle.fontSizeM }]}>{I18n.t('dismiss', { locale: this.props.setting.lang })}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                }
            </Animated.View>
        )
    }
}

function mapStateToProps(state) {
    return {
        login: state.login,
        setting: state.setting
    }
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(loginActions, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WhatsNew)
