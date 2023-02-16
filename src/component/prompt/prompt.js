import React, { Component } from 'react';
import {
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    PixelRatio,
    Dimensions,
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView
} from 'react-native';
import styles from './style/prompt.style';
import { VibrancyView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBar from '../../modules/_global/ProgressBar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../../screens/login/login.actions';
import { checkPropsStateShouldUpdate } from '../../lib/base/functionUtil';
import { dataStorage } from '../../storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveVersion } from '../../app.actions';
import I18n from '../../modules/language';
import config from '../../config'
import ENUM from '../../enum'
import * as Controller from '../../memory/controller'

loginActions['saveVersion'] = saveVersion;

const { height, width } = Dimensions.get('window');

export class Prompt extends Component {
    constructor(props) {
        super(props);
                this.isMount = false;
        const obj = {};
        for (let index = 0; index < this.props.listInput.length; index++) {
            const element = this.props.listInput[index];
            obj[element.id] = element.defaultValue;
        }
        this.timeOut = null;
        this.state = {
            value: obj,
            visible: this.props.visible || false,
            submitDisabled: true,
            isFocus: false,
            errorText: '',
            editable: true,
            isSubmiting: false,
            cancelDisable: false,
            isDemo: Controller.isDemo(),
            id: 0,
            isSecureTextEntry: true
        };

        this._renderInput = this._renderInput.bind(this);
        this._onChangeText = this._onChangeText.bind(this);
        this._renderSubtitle = this._renderSubtitle.bind(this);
        this._renderLostConnectionTitle = this._renderLostConnectionTitle.bind(this)
        this.isPressCancel = false;
        this.emailInput = null;
        this.passwordInput = null;
    }

    componentDidMount() {
        this.isMount = true;
    }

    componentWillUnmount() {
        this.isMount = false;
    }

    componentWillReceiveProps(nextProps) {
        const { visible, errorText, isError, login } = nextProps;
        let temp = this.state.value;
        if (login.token !== '' || login.isLocked) {
            temp.password = '';
        }
        !visible && this.refs.prompt && this.refs.prompt.fadeOut();
        setTimeout(() => {
            this.isMount && this.setState({ visible }, () => {
                if (!this.isPressCancel) {
                    this.isMount && this.setState({
                        errorText,
                        isError,
                        value: temp
                    });
                }
            });
        }, 200)
    }

    _onChangeText(value, id) {
        this.isMount && this.setState({ isError: false, cancelDisable: false, errorText: '' }, () => {
            const obj = this.state.value;
            obj[id] = value;
            let disabled = false;
            if ((this.emailInput && this.state.value['username'] !== '') && (this.passwordInput && this.state.value['password'] !== '')) {
                disabled = false;
            } else {
                disabled = true;
            }
            if (value === '') {
                disabled = true;
            }
            this.isMount && this.setState({ value: obj, submitDisabled: disabled });
            this.props.onChangeText(value);
        })
    };

    _onSubmitPress() {
        this.isPressCancel = false;
        dataStorage.cancelLoginPress = false;
        const { value } = this.state;
        this.isMount && this.setState({ submitDisabled: true, editable: false, isSubmiting: true }, () => {
            // this.refs && this.refs.prompt && this.refs.prompt.fadeOutRight(500);
            this.changeAppVersion(this.state.isDemo);
            this.props.onSubmit(value, this.close.bind(this), this.errorCallback.bind(this));
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                this.isMount && this.setState({ cancelDisable: true })
            }, 2000)
        });
    };

    _onCancelPress() {
        this.isPressCancel = true;
        dataStorage.cancelLoginPress = true;
        this.timeOut && clearTimeout(this.timeOut)
        const { value } = this.state;
        let temp = {};
        temp.username = value.username;
        temp.password = '';
        this.isMount && this.setState({ value: temp, submitDisabled: true, editable: true, isSubmiting: false, errorText: '', cancelDisable: false }, () => {
            // this.refs && this.refs.prompt && this.refs.prompt.fadeOutDownBig(500);
            this.refs && this.refs.prompt && this.refs.prompt.fadeOut();
            // setTimeout(() => {
            //     this.props.onCancel();
            // }, 500);
            this.props.onCancel();
        });
    };

    close() {
        this.isMount && this.setState({ submitDisabled: false, editable: true, isSubmiting: false }, () => {
            // this.refs && this.refs.prompt && this.refs.prompt.fadeOutDownBig(1000);
            this.refs && this.refs.prompt && this.refs.prompt.fadeOut();
        });
    };

    errorCallback() {
        this.isMount && this.setState({ submitDisabled: true, editable: true, isSubmiting: false, cancelDisable: false }, () => {
            this.refs && this.refs.prompt && this.refs.prompt.shake(500);
        });
    };

    _rightIconInputPress(id) {
        if (id === 'username') {
            this.emailInput && this.emailInput.clear() && this.emailInput.setNativeProps({ value: '' });
            let _value = this.state.value;
            _value.username = '';
            this.emailInput && this.emailInput.focus();
            this.isMount && this.setState({ value: _value, submitDisabled: true });
        } else if (id === 'password') {
            this.isMount && this.setState({
                isSecureTextEntry: !this.state.isSecureTextEntry
            }, () => {
                this.passwordInput && this.passwordInput.blur()
            })
        }
    }
    _renderInput(listData) {
        const data = [];
        const {
            inputStyle
        } = this.props;
        listData.map((e, i) => {
            const condition = e.id === 'username' ? this.state.value['username'] === '' : this.state.value['username'] !== ''
            data.push(
                <View style={styles.dialogBody} key={e.id}>
                    <TextInput
                        ref={ref => {
                            if (e.id === 'username') {
                                this.emailInput = ref;
                            } else if (e.id === 'password') {
                                this.passwordInput = ref;
                            }
                        }}
                        underlineColorAndroid='rgba(0,0,0,0)'
                        editable={this.state.editable}
                        testID={`${e.placeholder}`}
                        style={[styles.dialogInput, inputStyle]}
                        defaultValue={e.defaultValue}
                        value={e.id === 'password' ? null : this.state.value[e.id]}
                        onChangeText={(value) => {
                            this._onChangeText(value, e.id);
                        }}
                        placeholderTextColor='grey'
                        selectionColor='rgba(0, 0, 0, 0.87)'
                        secureTextEntry={e.id === 'password' ? this.state.isSecureTextEntry : false}
                        placeholder={`${e.placeholder}`}
                        autoFocus={condition}
                        onFocus={() => {
                            this.isMount && this.setState({ isFocus: true, id: e.id })
                        }}
                        onBlur={() => {
                            this.isMount && this.setState({ isFocus: false, id: e.id })
                        }}
                        {...this.props.textInputProps} />
                    <TouchableOpacity style={[styles.rightIcon]} activeOpacity={1} onPress={this._rightIconInputPress.bind(this, e.id)}>
                        <Icon style={[styles.rightIconBody, { opacity: e.id === 'password' ? this.state.isSecureTextEntry ? 1 : 0.6 : 1 }]} name={e.rightIcon} size={16} />
                    </TouchableOpacity>
                </View>
            );
        });
        return data;
    }
    _renderSubtitle() {
        if (!this.props.onSubtitle) {
            return (<View style={[styles.dialogSubTitle]}>
                <Text style={[styles.dialogSubTitleText, this.props.subtitleStyle]}>
                    {this.props.subtitle}
                </Text>
            </View>);
        }
        return (<TouchableOpacity style={[styles.dialogSubTitle]} onPress={() => {
            this.props.onSubtitle();
            this.isMount && this.setState({ submitDisabled: false })
        }}>
            <Text style={[styles.dialogSubTitleText, this.props.subtitleStyle]}>
                {this.props.subtitle}
            </Text>
        </TouchableOpacity>);
    }

    _renderLostConnectionTitle() {
        if (this.props.lostConnectionTitle && !this.props.isConnected) {
            return (
                <Text style={this.props.lostConnectionTitleStyle ? this.props.lostConnectionTitleStyle : {}}>{this.props.lostConnectionTitle}</Text>
            )
        }
        return null;
    }

    setAnimationIn() {
        // this.refs && this.refs.prompt && this.refs.prompt.fadeInUpBig(800);
        this.refs && this.refs.prompt && this.refs.prompt.fadeIn(200);
    }

    setAnimationOut() {
        // this.refs && this.refs.prompt && this.refs.prompt.fadeOutDownBig(500);
        this.refs && this.refs.prompt && this.refs.prompt.fadeOut(500);
    }

    changeAppVersion(isDemo) {
        if (config.environment === ENUM.ENVIRONMENT.PRODUCTION) {
            // only enable with production environment
            this.props.actions.resetLogin()
            this.props.actions.saveVersion(isDemo);
            this.isMount && this.setState({ isDemo, submitDisabled: false });
        }
    }

    _renderDialog() {
        const {
            title,
            subtitle,
            // placeholder,
            // defaultValue,
            listInput,
            cancelText,
            submitText,
            titleStyle,
            titleContainerStyle,
            promptStyle,
            borderColor,
            buttonContainerStyle,
            buttonTextStyle,
            buttonStyle,
            submitButtonStyle,
            submitButtonTextStyle,
            cancelButtonStyle,
            cancelButtonTextStyle,
            inputStyle
        } = this.props;
        // const ClearView = this.state.clearing ? View : VibrancyView;
        const getStyle = (isDemo) => {
            return {
                backgroundColor: this.state.isDemo ? (isDemo ? '#00b800' : 'transparent') : (isDemo ? 'transparent' : '#00b800'),
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderTopLeftRadius: !isDemo ? 4 : 0,
                borderBottomLeftRadius: !isDemo ? 4 : 0,
                borderBottomRightRadius: isDemo ? 4 : 0,
                borderTopRightRadius: isDemo ? 4 : 0,
                overflow: 'hidden'
            }
        }
        return (
            <Animatable.View testID={'PromtModal'} style={[styles.dialog]} key='prompt' >
                <View style={styles.dialogOverlay} />
                {
                    Platform.OS === 'ios' ? (
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)' }}>
                            <Animatable.View ref='prompt'>
                                <View blurType='xlight' style={styles.dialogContent2}>
                                    <Animatable.View style={{ zIndex: 99999 }}>
                                        <View style={[styles.dialogTitle, titleContainerStyle]}>
                                            <Text style={[styles.dialogTitleText, titleStyle]}>
                                                {title}
                                            </Text>
                                            <View style={{ height: 25, backgroundColor: 'transparent', width: '100%', borderRadius: 4.8, flexDirection: 'row', borderWidth: 1, borderColor: '#00b800' }}>
                                                <TouchableOpacity style={getStyle(false)}
                                                    disabled={config.environment !== ENUM.ENVIRONMENT.PRODUCTION}
                                                    onPress={() => this.changeAppVersion(false)}>
                                                    <Text style={[CommonStyle.textDemo, { color: !this.state.isDemo ? '#ffffff' : '#00b800', opacity: config.environment === ENUM.ENVIRONMENT.PRODUCTION ? 1 : 0.54 }]}>{I18n.t('liveUpper', { locale: this.props.setting.lang })}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={getStyle(true)}
                                                    onPress={() => this.changeAppVersion(true)}>
                                                    <Text style={[CommonStyle.textDemo, { color: !this.state.isDemo ? '#00b800' : '#FFFfff' }]}>{config.environment === ENUM.ENVIRONMENT.PRODUCTION ? I18n.t('demoUpper', { locale: this.props.setting.lang }) : config.environment === ENUM.ENVIRONMENT.STAGING ? I18n.t('stagingUpper', { locale: this.props.setting.lang }) : I18n.t('nextUpper', { locale: this.props.setting.lang })}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {/*
                                this._renderSubtitle()
                            */}
                                        {
                                            this._renderLostConnectionTitle()
                                        }
                                        {
                                            this._renderInput(listInput)
                                        }
                                        {
                                            this.state.errorText === '' ? <View style={{ height: 16, width: '100%' }}></View>
                                                : <View style={styles.errorContainer}>
                                                    <Text style={CommonStyle.textError2}>{this.state.errorText}</Text>
                                                </View>
                                        }
                                        <View style={{ width: '100%', backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#CECECE' }}></View>
                                        <View style={styles.dialogFooter}>
                                            <TouchableOpacity testID='CancelButton' onPress={this._onCancelPress.bind(this)} style={{ flex: 49 }} disabled={this.props.isConnected ? this.state.cancelDisable : false}>
                                                <View style={[styles.dialogAction, buttonStyle, cancelButtonStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    <Text style={[styles.dialogActionText, buttonTextStyle, cancelButtonTextStyle, { color: this.props.isConnected ? this.state.cancelDisable ? '#808080' : '#1e90ff' : '#1e90ff' }]}>
                                                        {cancelText}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={{ height: '100%', flex: 2, backgroundColor: 'transparent', borderRightWidth: 0.5, borderRightColor: '#CECECE', zIndex: 99999 }}></View>
                                            <TouchableOpacity testID='SubmitButton' onPress={this._onSubmitPress.bind(this)} style={{ flex: 49 }} disabled={this.props.isConnected ? this.state.submitDisabled : true}>
                                                <View style={[styles.dialogAction, buttonStyle, submitButtonStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    {
                                                        this.props.login.isLoading ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                                            : this.props.login.isAuthLoading ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' /> : <Text style={[styles.dialogActionText, buttonTextStyle, submitButtonTextStyle, { color: !this.props.isConnected || this.state.submitDisabled ? '#808080' : '#1e90ff' }]}>
                                                                {`${submitText} (${this.state.isDemo ? config.environment === ENUM.ENVIRONMENT.PRODUCTION ? I18n.t('demoUpper', { locale: this.props.setting.lang }) : config.environment === ENUM.ENVIRONMENT.STAGING ? I18n.t('stagingUpper', { locale: this.props.setting.lang }) : I18n.t('nextUpper', { locale: this.props.setting.lang }) : I18n.t('liveUpper', { locale: this.props.setting.lang })})`}
                                                            </Text>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </Animatable.View>
                                </View></Animatable.View>
                        </KeyboardAvoidingView>) : (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Animatable.View ref="prompt" style={[styles.dialogContent, { borderColor }, promptStyle]}>
                                    <View style={[styles.dialogTitle, titleContainerStyle]}>
                                        <Text style={[styles.dialogTitleText, titleStyle]}>
                                            {title}
                                        </Text>
                                        <View style={{ height: 25, backgroundColor: 'transparent', width: '100%', borderRadius: 4.8, flexDirection: 'row', borderWidth: 1, borderColor: '#00b800' }}>
                                            <TouchableOpacity style={getStyle(false)}
                                                disabled={config.environment !== ENUM.ENVIRONMENT.PRODUCTION}
                                                onPress={() => this.changeAppVersion(false)}>
                                                <Text style={[CommonStyle.textDemo, { color: !this.state.isDemo ? '#ffffff' : '#00b800', opacity: config.environment === ENUM.ENVIRONMENT.PRODUCTION ? 1 : 0.54 }]}>{I18n.t('liveUpper', { locale: this.props.setting.lang })}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={getStyle(true)}
                                                onPress={() => this.changeAppVersion(true)}>
                                                <Text style={[CommonStyle.textDemo, { color: !this.state.isDemo ? '#00b800' : '#FFFfff' }]}>{config.environment === ENUM.ENVIRONMENT.PRODUCTION ? I18n.t('demoUpper', { locale: this.props.setting.lang }) : config.environment === ENUM.ENVIRONMENT.STAGING ? I18n.t('stagingUpper', { locale: this.props.setting.lang }) : I18n.t('nextUpper', { locale: this.props.setting.lang })}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/* {
                                        this._renderSubtitle()
                                    } */}
                                    {
                                        this._renderLostConnectionTitle()
                                    }
                                    {
                                        this._renderInput(listInput)
                                    }
                                    {
                                        this.state.errorText === '' ? <View style={{ height: 16, width: '100%' }}></View>
                                            : <View style={styles.errorContainer}>
                                                <Text style={CommonStyle.textError2}>{this.state.errorText}</Text>
                                            </View>
                                    }
                                    <View style={[styles.dialogFooter, { borderColor }, buttonContainerStyle]}>
                                        <TouchableOpacity disabled={this.props.isConnected ? this.state.cancelDisable : false}
                                            testID='CancelButton' onPress={this._onCancelPress.bind(this)} style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#CECECE' }}>
                                            <View style={[styles.dialogAction, buttonStyle, cancelButtonStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                                                <Text style={[styles.dialogActionText, buttonTextStyle, cancelButtonTextStyle, { color: this.props.isConnected ? this.state.cancelDisable ? '#808080' : '#10a8b2' : '#10a8b2', fontSize: CommonStyle.font13 }]}>
                                                    {cancelText}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity testID='SubmitButton' onPress={this._onSubmitPress.bind(this)} style={{ flex: 1 }} disabled={this.props.isConnected ? this.state.submitDisabled : true}>
                                            <View style={[styles.dialogAction, buttonStyle, submitButtonStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                                                {
                                                    this.state.isSubmiting ? <ActivityIndicator style={{ width: 24, height: 24 }} color='black' />
                                                        : <Text style={[styles.dialogActionText, buttonTextStyle, submitButtonTextStyle, { color: !this.props.isConnected || this.state.submitDisabled ? '#808080' : '#10a8b2', fontSize: CommonStyle.font13 }]}>
                                                            {`${submitText} (${this.state.isDemo ? config.environment === ENUM.ENVIRONMENT.PRODUCTION ? I18n.t('demoUpper', { locale: this.props.setting.lang }) : config.environment === ENUM.ENVIRONMENT.STAGING ? I18n.t('stagingUpper', { locale: this.props.setting.lang }) : I18n.t('nextUpper', { locale: this.props.setting.lang }) : I18n.t('liveUpper', { locale: this.props.setting.lang })})`}
                                                        </Text>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </Animatable.View>
                            </View>
                        )
                }
            </Animatable.View>
        );
    };

    // shouldComponentUpdate(nextProps, nextState) {
    //     const listProps = [{ login: ['isLogin'] }];
    //     const listState = ['visible', {value: ['username', 'password']}, 'submitDisabled', 'isFocus', 'errorText'];
    //     let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    //     return check;
    //   }

    render() {
        if (!this.state.visible) return <View></View>
        return (
            <Modal animationType='none'
                // onShow={this.setAnimationIn.bind(this)}
                // onDismiss={this.setAnimationOut.bind(this)}
                onRequestClose={() => console.log('onrequest close')}
                transparent={true} visible={this.state.visible}>
                {this._renderDialog()}
            </Modal>
        );
    }
};

Prompt.defaultProps = {
    visible: false,
    listInput: [],
    subtitle: '',
    title: '',
    cancelText: 'Cancel',
    submitText: 'OK',
    borderColor: '#ccc',
    promptStyle: {},
    titleStyle: {},
    subtitleStyle: {},
    buttonStyle: {},
    buttonTextStyle: {},
    submitButtonStyle: {},
    submitButtonTextStyle: {},
    cancelButtonStyle: {},
    cancelButtonTextStyle: {},
    inputStyle: {},
    onChangeText: () => { }
}

Prompt.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    visible: PropTypes.bool,
    listInput: PropTypes.array,
    onCancel: PropTypes.func.isRequired,
    cancelText: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    submitText: PropTypes.string,
    onChangeText: PropTypes.func.isRequired,
    onSubtitle: PropTypes.func,
    borderColor: PropTypes.string,
    promptStyle: PropTypes.object,
    titleStyle: PropTypes.object,
    subtitleStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    buttonTextStyle: PropTypes.object,
    submitButtonStyle: PropTypes.object,
    submitButtonTextStyle: PropTypes.object,
    cancelButtonStyle: PropTypes.object,
    cancelButtonTextStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    textInputProps: PropTypes.object
};

function mapStateToProps(state, ownProps) {
    return {
        login: state.login,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(loginActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Prompt);
