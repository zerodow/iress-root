import React from 'react'
import {
    View, TextInput, Text, KeyboardAvoidingView, Dimensions, Platform, Matrix
} from 'react-native'
import { connect } from 'react-redux'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Emitter
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '../../streaming/channel'
// Storage
import { dataStorage, func } from '../../storage'
import ENUM from '../../enum'
import * as Controller from '../../memory/controller'
import OrderEnum from '../../constants/order_enum'
import NewTag from '~/constants/newsTag'
// Util
import * as Util from '../../util'
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as Business from '../../business'
import { forEach, size } from 'lodash'
// Api
import * as Api from '../../api'
// Component
import XComponent from '../../component/xComponent/xComponent'
import I18n from '../../modules/language/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation';
import DeliveryMethod from './alert_delivery_method'
import TouchableOpacityOpt from '@component/touchableOpacityOpt/'
import { TYPE } from './components/ButtonConfirm'

import { getAllTagNewSelected, isSelectAll } from './functionCommon'
const { width, height } = Dimensions.get('window')
const {
    PRICE_LAST_PRICE_FUTURE_ALERT_TARGET,
    PRICE_LAST_PRICE_ALERT_TARGET,
    PRICE_NONE_LAST_PRICE_ALERT_TARGET,
    ALERT_TYPE,
    PRICE_ALERT_TRIGGER,
    NEWS_ALERT_TRIGGER,
    TYPE_VALID_CUSTOM_INPUT,
    PRICE_DECIMAL,
    NEWS_ALERT_REPEAT,
    TAG_NEWS_KEY_BY_STRING,
    TAG_NEWS_STRING_BY_KEY,
    DELIVERY_METHOD
} = ENUM
const TYPE_PICKER = {
    ALERT_TYPE: 'ALERT_TYPE',
    ALERT_TRIGGER: 'ALERT_TRIGGER',
    ALERT_TARGET_NEW: 'ALERT_TARGET_NEW',
    ALERT_TARGET_PRICE: 'ALERT_TARGET_PRICE',
    ALERT_REPEAT: 'ALERT_REPEAT',
    ORDER_TYPE: 'ORDER_TYPE',
    DURATION: 'DURATION',
    EXCHANGE: 'EXCHANGE'
}
export default class AlertOptions extends XComponent {
    init() {
        this.dic = {
            isFocus: false,
            isBlur: true,
            alertType: {
                key: ALERT_TYPE.LAST_PRICE.key
            },
            priceObject: this.props.priceObject || {},
            listPicker: [],
            listRefPicker: []
            // Có
            // 1> alertType
            // 2> trigger
            // 3> targetPrice
            // 4> targetValue
            // 5> targetNew
            // 6> repeat
            // 7> dicTagNewsSelected
            // 8> deliveryMethodNotification
            // 9> deliveryMethodEmail
        }
        this.setDefaultData()
        this.subChangePriceObject()
        this.subBlurWithPan()

        this.state = {
            targetValue: this.dic.targetValue.toString()
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    getEnumPriceAlertTarget() {
        const { isModify } = this.props
        let { symbolClass } = this.dic.priceObject
        if (isModify) {
            const { symbol } = this.props.alertObj
            symbolClass = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].class ? dataStorage.symbolEquity[symbol].class : ''
        }
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
                return Business.isFuture(symbolClass)
                    ? PRICE_LAST_PRICE_FUTURE_ALERT_TARGET
                    : PRICE_LAST_PRICE_ALERT_TARGET
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
            case ALERT_TYPE.CHANGE_POINT.key:
            case ALERT_TYPE.CHANGE_PERCENT.key:
            case ALERT_TYPE.TODAY_VOLUME.key:
                return PRICE_NONE_LAST_PRICE_ALERT_TARGET
            default:
                return PRICE_LAST_PRICE_ALERT_TARGET
        }
    }

    subBlurWithPan() {
        const channel = this.props.channelBlurWithPan
        Emitter.addListener(channel, this.id, () => {
            this.onBlurWithPan()
        })
    }

    subChangePriceObject() {
        const channel = this.props.channelAllPrice
        Emitter.addListener(channel, this.id, priceObject => {
            this.dic.priceObject = priceObject
            /**
             * Kiem tra co co nen setdefault khong
             */
            if (Controller.getShouldSetDefault()) {
                this.setDefaultData()
            } else {
                Controller.setShouldSetDefault(true)
            }
            this.setState({})
        })
    }

    setDefaultData() {
        this.dic.alertType = this.getDefaultAlertType() || {}
        this.dic.trigger = this.getDefaultAlertTrigger()
        this.dic.repeat = this.getDefaultRepeatNew()
        this.setDefaultAlertTarget()
        this.setDefaultDeliveryMethod()
    }

    setDefaultDeliveryMethod() {
        if (this.props.alertObj && this.props.alertObj.method) {
            // Email
            if (this.props.alertObj.method.includes('EMAIL')) {
                this.dic.deliveryMethodEmail = true
            } else {
                this.dic.deliveryMethodEmail = false
            }
            // Notification
            if (this.props.alertObj.method.includes('NOTIFICATION')) {
                this.dic.deliveryMethodNotification = true
            } else {
                this.dic.deliveryMethodNotification = false
            }
        } else {
            this.dic.deliveryMethodEmail = true
            this.dic.deliveryMethodNotification = true
        }
    }

    getModifyDefaultAlertType(key) {
        return ALERT_TYPE[key]
    }

    getNewDefaultAlertType() {
        return ALERT_TYPE.LAST_PRICE
    }

    getDefaultAlertType() {
        if (this.props.alertObj && this.props.alertObj.alert_type) {
            // modify alert
            const key = this.props.alertObj.alert_type
            return this.getModifyDefaultAlertType(key)
        }
        // new alert
        return this.getNewDefaultAlertType()
    }

    getModifyDefaultAlertTrigger(alertObj) {
        const { alert_type: alertType, alert_trigger: alertTrigger } = alertObj
        // modify alert
        if (alertType === 'NEWS') {
            return NEWS_ALERT_TRIGGER[alertTrigger]
        }
        return PRICE_ALERT_TRIGGER[alertTrigger]
    }

    getNewDefaultAlertTrigger() {
        // new alert
        return PRICE_ALERT_TRIGGER.AT_OR_ABOVE
    }

    getDefaultAlertTrigger() {
        if (this.props.alertObj && this.props.alertObj.alert_trigger) {
            return this.getModifyDefaultAlertTrigger(this.props.alertObj)
        }
        return this.getNewDefaultAlertTrigger()
    }
    setModifyDefaultAlertTarget(alertObj = {}) {
        // modify alert
        if (alertObj.alert_type === 'NEWS') {
            this.dic.dicTagNewsSelected = this.getDefaultDicTagNewsSelected(alertObj.target)
            this.dic.targetNew = this.getTagNewUI()
            // Lấy mặc định cho price
            const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
            this.dic.targetValue = 0
            this.dic.targetPrice = enumPriceAlertTarget.USER_INPUT
        } else {
            let key = ''
            if (typeof alertObj.target === 'number') {
                const targetValue = alertObj.target
                this.dic.targetValue = targetValue
                key = 'USER_INPUT'
            } else {
                key = alertObj.target
                this.dic.targetValue = 0
            }
            const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
            this.dic.targetPrice = enumPriceAlertTarget[key]
            // Lấy mặc định cho news
            this.dic.targetNew = 'Everything'
            this.dic.dicTagNewsSelected = getAllTagNewSelected()
        }
    }

    setNewDefaultAlertTarget() {
        // new alert
        // Không có target thì set default
        const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
        this.dic.targetPrice = enumPriceAlertTarget.USER_INPUT
        this.dic.targetValue = 0
        this.dic.targetNew = 'Everything'
        this.dic.dicTagNewsSelected = getAllTagNewSelected()
    }

    setDefaultAlertTarget() {
        if (this.props.alertObj && this.props.alertObj.target) {
            return this.setModifyDefaultAlertTarget(this.props.alertObj)
        }
        return this.setNewDefaultAlertTarget()
    }

    getDefaultDicTagNewsSelected(target) {
        const tagNames = FunctionUtil.checkNewTag(target)
        const dicTagNewsSelected = {}
        forEach(NewTag, (el, key) => {
            if (tagNames.includes(key)) {
                dicTagNewsSelected[key] = key
            }
        })
        return dicTagNewsSelected
    }

    getModifyDefaultRepeatNew(key) {
        // modify alert
        return NEWS_ALERT_REPEAT[key]
    }

    getNewDefaultRepeatNew() {
        // new alert
        return NEWS_ALERT_REPEAT.EVERYTIME
    }

    getDefaultRepeatNew() {
        if (this.props.alertObj && this.props.alertObj.alert_repeat) {
            const key = this.props.alertObj.alert_repeat
            return this.getModifyDefaultRepeatNew(key)
        }
        return this.getNewDefaultRepeatNew()
    }

    getNumberCountTargetNew() {
        if (isSelectAll(this.dic.dicTagNewsSelected)) {
            return size(NewTag)
        }
        const targetNew = this.dic.targetNew.replace(/,\s*$/, '')
        return targetNew.split(',').length
    }

    getTargetNew() {
        const targetNew = this.dic.targetNew.replace(/,\s*$/, '')
        return targetNew.split(',')
    }
    getTargetNew2() {
        let result = []
        forEach(this.dic.dicTagNewsSelected, (el, key) => {
            const tmp = NewTag[key]
            result = [...result, ...tmp.TAGS]
        })
        return result
    }
    getDeliveryMethod() {
        const deliveryMethod = []
        if (this.dic.deliveryMethodEmail) {
            deliveryMethod.push('EMAIL')
        }
        if (this.dic.deliveryMethodNotification) {
            deliveryMethod.push('NOTIFICATION')
        }
        return deliveryMethod
    }

    getAlertPriceObject() {
        const { isModify } = this.props
        const { symbol } = isModify ? this.props.alertObj : this.dic.priceObject
        const deliveryMethod = this.getDeliveryMethod()
        const isEditable = this.checkEditAble()
        const symbolObj = isModify ? {} : { symbol }
        return isEditable
            ? {
                alert_type: this.dic.alertType.value,
                alert_trigger: this.dic.trigger.value,
                target: this.dic.targetPrice.value,
                target_value: parseFloat(this.dic.targetValue),
                method: deliveryMethod,
                ...symbolObj
            }
            : {
                alert_type: this.dic.alertType.value,
                alert_trigger: this.dic.trigger.value,
                target: this.dic.targetPrice.value,
                method: deliveryMethod,
                ...symbolObj
            }
    }

    getAlertNewsObject() {
        const { isModify } = this.props
        const { symbol } = isModify ? this.props.alertObj : this.dic.priceObject
        const deliveryMethod = this.getDeliveryMethod()
        const target = this.getTargetNew2()
        const symbolObj = isModify ? {} : { symbol }

        return {
            alert_type: this.dic.alertType.value,
            alert_trigger: this.dic.trigger.value,
            target,
            alert_repeat: this.dic.repeat.value,
            method: deliveryMethod,
            ...symbolObj
        }
    }

    getAlertObject() {
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
            case ALERT_TYPE.CHANGE_POINT.key:
            case ALERT_TYPE.CHANGE_PERCENT.key:
            case ALERT_TYPE.TODAY_VOLUME.key:
                return this.getAlertPriceObject()
            case ALERT_TYPE.NEWS.key:
                return this.getAlertNewsObject()
            default:
                return false
        }
    }

    updateError(error) {
        this.props.updateError && this.props.updateError(error)
    }
    updateStyleErrorInput = (errorCode) => {
        if (errorCode === 'INVALID_PARAMS') {
            this.error = errorCode
            this.refWrapperInput && this.refWrapperInput.setNativeProps({
                style: [this.refWrapperInput.style, {
                    borderWidth: 1,
                    borderColor: 'red'
                }]
            })
        }
    }
    resetError = () => {
        this.error && this.refWrapperInput && this.refWrapperInput.setNativeProps({
            style: [this.refWrapperInput.style, {
                borderWidth: 1,
                borderColor: CommonStyle.color.dusk
            }]
        })
        this.error = null
    }
    updateStatusFocusAndBlur({ isFocus, isBlur }) {
        this.dic.isFocus = isFocus
        this.dic.isBlur = isBlur
    }

    onBlurWithPan() {
        if (this.dic.isBlur) return
        this.refInput && this.refInput.blur()
    }

    onFocus() {
        dataStorage.hideButtonConfirm && dataStorage.hideButtonConfirm()
        const isFocus = true
        const isBlur = false
        this.updateStatusFocusAndBlur({ isFocus, isBlur })
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
            case ALERT_TYPE.CHANGE_POINT.key:
            case ALERT_TYPE.CHANGE_PERCENT.key:
            case ALERT_TYPE.TODAY_VOLUME.key:
                this.refInput && this.refInput.setNativeProps({
                    text: this.dic.targetValue ? this.dic.targetValue.toString() : ''
                })
                break;
            default:
                break;
        }
    }

    onBlur() {
        const isFocus = false
        const isBlur = true
        this.updateStatusFocusAndBlur({ isFocus, isBlur })
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
            case ALERT_TYPE.CHANGE_POINT.key:
            case ALERT_TYPE.CHANGE_PERCENT.key:
                const decimal = this.getDecimalTargetPrice()
                this.refInput && this.refInput.setNativeProps({
                    text: FunctionUtil.formatNumberNew2(this.dic.targetValue, decimal)
                })
                break;
            case ALERT_TYPE.TODAY_VOLUME.key:
                this.refInput && this.refInput.setNativeProps({
                    text: FunctionUtil.formatNumberNew2(this.dic.targetValue, PRICE_DECIMAL.VOLUME)
                })
                break;
            default:
                break;
        }
    }

    onCreateAlert(cb) {
        const url = Api.getApiCreateAlert()
        const bodyData = this.getAlertObject()
        this.disableButtonConfirm()
        Api.postData(url, { data: bodyData })
            .then(res => {
                if (res) {
                    const { errorCode } = res
                    if (errorCode === 'SUCCESS') {
                        console.log('onCreateAlert success')
                        this.updateError({ errorCode, error: I18n.t('createAlertSuccessfull') })
                    } else {
                        console.log('onCreateAlert error', errorCode)
                        this.updateError({ errorCode, error: I18n.t(OrderEnum[errorCode]) })
                        this.updateStyleErrorInput(errorCode)
                    }
                    cb && cb()
                } else {
                    console.log('onCreateAlert RESPONSE NULL')
                    const errorCode = 'Response is NULL'
                    this.updateError({ errorCode: 'ERROR', error: errorCode })
                    cb && cb()
                }
            })
            .catch(err => {
                console.log(err)
                console.log('onCreateAlert error', err)
                this.updateError({ errorCode: 'ERROR', error: err })
                cb && cb()
            })
    }
    hiddenButtonConfirm = () => {
        Emitter.emit(Channel.getChannelUpdateStatusButtonConfirmAlert(), { status: TYPE.HIDDEN })
    }
    enableButton = () => {
        Emitter.emit(Channel.getChannelUpdateStatusButtonConfirmAlert(), { status: TYPE.SHOW })
    }
    disableButtonConfirm = () => {
        Emitter.emit(Channel.getChannelUpdateStatusButtonConfirmAlert(), { status: TYPE.DISABLE })
    }
    onModifyAlert(cb) {
        const { alertObj = {} } = this.props
        const { alert_id: alertID } = alertObj
        const url = Api.getApiModifyAlert(alertID)
        const bodyData = this.getAlertObject()
        this.disableButtonConfirm()
        Api.putData(url, { data: bodyData })
            .then(res => {
                if (res) {
                    const { errorCode } = res
                    if (errorCode === 'SUCCESS') {
                        console.log('onModifyAlert success')
                        this.updateError({ errorCode, error: I18n.t('modifyAlertSuccessfull') })
                    } else {
                        console.log('onModifyAlert error', errorCode)
                        this.updateError({ errorCode, error: I18n.t(OrderEnum[errorCode]) })
                        this.updateStyleErrorInput(errorCode)
                    }
                    cb && cb()
                } else {
                    console.log('onModifyAlert RESPONSE NULL')
                    const errorCode = 'Response is NULL'
                    this.updateError({ errorCode: 'ERROR', error: errorCode })
                    cb && cb()
                }
            })
            .catch(err => {
                console.log('onModifyAlert error', err)
                this.updateError({ errorCode: 'ERROR', error: err })
                cb && cb()
            })
    }

    updateDeliveryMethod({ type, switchValue }) {
        if (type === DELIVERY_METHOD.EMAIL) {
            this.dic.deliveryMethodEmail = switchValue
        } else {
            this.dic.deliveryMethodNotification = switchValue
        }
    }

    getTagNewUI() {
        const listKeyTagNew = Object.keys(this.dic.dicTagNewsSelected)
        if (listKeyTagNew.length > 1) {
            if (isSelectAll(this.dic.dicTagNewsSelected)) {
                // Trong dic đã có tag All news
                return TAG_NEWS_STRING_BY_KEY['Everything']
            }
            let uiString = ''
            listKeyTagNew.map(el => {
                uiString += `${I18n.t(NewTag[el].DISPLAY_NAME)},`
            })
            uiString = uiString.replace(/.$/, '')
            // const firstTagNew = listKeyTagNew[0]
            return uiString
        } else if (listKeyTagNew.length === 1) {
            const firstTagNew = listKeyTagNew[0]
            return I18n.t(NewTag[firstTagNew].DISPLAY_NAME)
        } else {
            return ''
        }
    }

    checkEditAble() {
        try {
            if (this.dic.alertType.key === ALERT_TYPE.NEWS.key) {
                return false
            }
            const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
            return this.dic.targetPrice.key === enumPriceAlertTarget.USER_INPUT.key
        } catch (error) {
            console.log(error)
            return false
        }
    }

    checkChangeAlertType(oldAlertType, newAlertType) {
        const oldKey = oldAlertType.key
        const newKey = newAlertType.key
        const condition3 = oldKey === ALERT_TYPE.LAST_PRICE.key && newKey !== ALERT_TYPE.LAST_PRICE.key
        const condition4 = oldKey === ALERT_TYPE.NEWS.key && newKey !== ALERT_TYPE.NEWS.key
        const condition1 = (oldKey === ALERT_TYPE.BID_PRICE.key ||
            oldKey === ALERT_TYPE.OFFER_PRICE.key ||
            oldKey === ALERT_TYPE.CHANGE_POINT.key ||
            oldKey === ALERT_TYPE.CHANGE_PERCENT.key ||
            oldKey === ALERT_TYPE.TODAY_VOLUME.key) && newKey === ALERT_TYPE.NEWS.key
        const condition2 = (oldKey === ALERT_TYPE.BID_PRICE.key ||
            oldKey === ALERT_TYPE.OFFER_PRICE.key ||
            oldKey === ALERT_TYPE.CHANGE_POINT.key ||
            oldKey === ALERT_TYPE.CHANGE_PERCENT.key ||
            oldKey === ALERT_TYPE.TODAY_VOLUME.key) && newKey === ALERT_TYPE.LAST_PRICE.key
        return condition1 || condition2 || condition3 || condition4
    }

    setTriggerByAlertType() {
        if (this.dic.alertType.key === ALERT_TYPE.NEWS.key) {
            this.dic.trigger = NEWS_ALERT_TRIGGER.PriceSensitive
        } else {
            this.dic.trigger = PRICE_ALERT_TRIGGER.AT_OR_ABOVE
        }
    }

    setTargetValueByAlertType() {
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
                this.dic.targetValue = 0
                break;
            case ALERT_TYPE.CHANGE_POINT.key:
            case ALERT_TYPE.CHANGE_PERCENT.key:
                this.dic.targetValue = 0
                break;
            case ALERT_TYPE.TODAY_VOLUME.key:
                this.dic.targetValue = 0
                break;
            default:
                this.dic.targetValue = 0
                break;
        }
    }

    setTargetPriceByAlertType() {
        if (this.dic.alertType.key === ALERT_TYPE.NEWS.key) return
        const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
        this.dic.targetPrice = enumPriceAlertTarget.USER_INPUT
        this.dic.targetValue = 0
    }

    setTargetNewByAlertType() {
        if (this.dic.alertType.key !== ALERT_TYPE.NEWS.key) return
        this.dic.targetNew = 'Everything'
    }

    setRepeatByAlertType() {
        if (this.dic.alertType.key !== ALERT_TYPE.NEWS.key) return
        this.dic.repeat = NEWS_ALERT_REPEAT.EVERYTIME
    }
    getTop = (type) => {
        return new Promise(resolve => {
            const ref = this.dic.listRefPicker[type]
            if (ref) {
                ref.measure((fx, fy, width, height, px, py) => {
                    resolve({ top: py + height, height })
                })
            } else {
                resolve(0)
            }
        })
    }
    onPressAlertType() {
        const listAlertType = Util.getValueObject(ALERT_TYPE)
        this.getTop(TYPE_PICKER.ALERT_TYPE).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    listItem: listAlertType,
                    title: I18n.t('titleSelectAlertType'),
                    textBtnCancel: I18n.t('cancel'),
                    onCancel: this.onCancel,
                    onSelect: this.onSelectAlertType,
                    onPressBackdrop: this.onCancel,
                    top: top,
                    height,
                    value: this.dic.alertType
                }
            })
        })
    }
    onPressPriceTrigger() {
        const listTrigger = Util.getValueObject(PRICE_ALERT_TRIGGER)
        this.getTop(TYPE_PICKER.ALERT_TRIGGER).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    listItem: listTrigger,
                    title: I18n.t('titleSelectTrigger'),
                    textBtnCancel: I18n.t('cancel'),
                    onCancel: this.onCancel,
                    onSelect: this.onSelectTrigger,
                    onPressBackdrop: this.onCancel,
                    top: top,
                    height,
                    value: this.dic.trigger

                }
            })
        })
    }

    onPressNewsTrigger() {
        const listTrigger = Util.getValueObject(NEWS_ALERT_TRIGGER)
        this.getTop(TYPE_PICKER.ALERT_TRIGGER).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    listItem: listTrigger,
                    title: I18n.t('titleSelectTrigger'),
                    textBtnCancel: I18n.t('cancel'),
                    onCancel: this.onCancel,
                    onSelect: this.onSelectTrigger,
                    onPressBackdrop: this.onCancel,
                    numberItem: 2,
                    top: top,
                    height,
                    value: this.dic.trigger
                }
            })
        })
    }
    onPressTargetPrice() {
        if (this.dic.alertType.key !== ALERT_TYPE.LAST_PRICE.key) return
        const enumPriceAlertTarget = this.getEnumPriceAlertTarget()
        const listTargetPrice = Util.getValueObject(enumPriceAlertTarget)
        this.getTop(TYPE_PICKER.ALERT_TARGET_PRICE).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    listItem: listTargetPrice,
                    title: I18n.t('titleSelectTargetPrice'),
                    textBtnCancel: I18n.t('cancel'),
                    onCancel: this.onCancel,
                    onSelect: this.onTargetPrice,
                    onPressBackdrop: this.onCancel,
                    top: top,
                    height,
                    value: this.dic.targetPrice
                }
            })
        })
    }

    onPressTargetNews() {
        this.getTop(TYPE_PICKER.ALERT_TARGET_NEW).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.TargetNewModal',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    onCancel: this.onCancel,
                    onPressBackdrop: this.onCancel,
                    onDone: this.onTargetNews,
                    top: top,
                    height,
                    value: { ...this.dic.dicTagNewsSelected }
                    // value: this.dic.repeat
                }
            })
        })
    }

    onPressNewsRepeat() {
        const listNewsRepeat = Util.getValueObject(NEWS_ALERT_REPEAT)
        this.getTop(TYPE_PICKER.ALERT_REPEAT).then(({ top, height }) => {
            Navigation.showModal({
                screen: 'equix.PickerBottomV2',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    listItem: listNewsRepeat,
                    title: I18n.t('repeatNewsLabel'),
                    textBtnCancel: I18n.t('cancel'),
                    onCancel: this.onCancel,
                    onSelect: this.onNewsRepeat,
                    onPressBackdrop: this.onCancel,
                    numberItem: 2,
                    top: top,
                    height,
                    value: this.dic.repeat
                }
            })
        })
    }

    onSelectAlertType(obj) {
        this.resetError()
        this.updateDisableButtonConfirm(false)
        const isChangeAlertType = this.checkChangeAlertType(this.dic.alertType, obj)
        this.dic.alertType = obj
        this.setTargetValueByAlertType()
        if (isChangeAlertType) {
            this.setTriggerByAlertType()
            this.setTargetPriceByAlertType()
            // this.setTargetNewByAlertType()
            // this.setRepeatByAlertType()
        }
        this.onCancel()
        this.setState({})
    }

    onSelectTrigger(obj) {
        this.resetError()
        this.updateDisableButtonConfirm(false)
        this.dic.trigger = obj
        this.onCancel()
        this.setState({})
    }

    onTargetPrice(obj) {
        this.resetError()
        this.updateDisableButtonConfirm(false)
        this.dic.targetPrice = obj
        this.onCancel()
        this.setState({})
    }

    onTargetNews(dicTagNewsSelected = {}) {
        this.resetError()
        this.updateDisableButtonConfirm(false)
        let targetNew = ''
        Object.keys(dicTagNewsSelected).map(tagNew => {
            targetNew += `${tagNew},`
        })
        this.dic.targetNew = targetNew
        this.dic.dicTagNewsSelected = dicTagNewsSelected
        this.onCancel()
        this.setState({})
    }

    onNewsRepeat(obj) {
        this.resetError()
        this.updateDisableButtonConfirm(false)
        this.dic.repeat = obj
        this.onCancel()
        this.setState({})
    }

    onCancel() {
        Navigation.dismissModal({
            animated: false,
            animationType: 'none'
        })
    }

    getDecimalTargetPrice() {
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
            case ALERT_TYPE.CHANGE_POINT.key:
                return PRICE_DECIMAL.PRICE
            case ALERT_TYPE.CHANGE_PERCENT.key:
                return PRICE_DECIMAL.PERCENT
            case ALERT_TYPE.TODAY_VOLUME.key:
                return PRICE_DECIMAL.VOLUME
            default:
                return PRICE_DECIMAL.VOLUME
        }
    }

    formatTargetPrice(editable) {
        const decimal = this.getDecimalTargetPrice()
        const value = editable
            ? this.dic.isFocus
                ? this.dic.targetValue ? this.dic.targetValue.toString() : ''
                : FunctionUtil.formatNumberNew2(this.dic.targetValue, decimal)
            : (this.dic.targetPrice && this.dic.targetPrice.key ? I18n.t(this.dic.targetPrice.key) : '')
        return value
    }

    validatePrice(newTargetValue) {
        const oldStr = this.state.targetValue
        const newStr = newTargetValue
        const oldStrLength = oldStr.length
        const newStrLength = newStr.length
        const listValue = (oldStr + '').split('.');
        const firstChar = newTargetValue.charAt(0)
        if (isNaN(firstChar)) {
            return false
        }
        if (newStrLength <= oldStrLength) {
            // Xoá
            return true
        }
        if (listValue && listValue[0] && listValue[0].length > 15) return false;
        if (oldStr.includes('.')) {
            // Thêm character
            const regex = /^[0-9]*\.([0-9]{0,4})?$/
            if (newTargetValue.match(regex)) {
                return true
            }
            return false
        } else {
            const regex = /^[0-9]*\.?([0-9]{0,4})?$/
            if (newTargetValue.match(regex)) {
                return true
            }
            return false
        }
    }

    validatePercent(newTargetValue, isPecent) {
        const oldStr = this.state.targetValue
        const newStr = newTargetValue
        const oldStrLength = oldStr.length
        const newStrLength = newStr.length
        const listValue = (oldStr + '').split('.');
        if (newStrLength <= oldStrLength && oldStr !== '0') {
            // Xoá
            return true
        }
        if (listValue && listValue[0] && listValue[0].length > 15) return false;
        if (oldStr.includes('.')) {
            // Thêm character
            const regex = isPecent ? /^-?[0-9]*\.([0-9]{0,2})?$/ : /^-?[0-9]*\.([0-9]{0,4})?$/
            if (newTargetValue.match(regex)) {
                return true
            }
            return false
        } else {
            const regex = isPecent ? /^-?[0-9]*\.?([0-9]{0,2})?$/ : /^-?[0-9]*\.?([0-9]{0,4})?$/
            if (newTargetValue.match(regex)) {
                return true
            }
            return false
        }
    }

    validateVolume(newTargetValue) {
        const oldStr = this.state.targetValue
        const newStr = newTargetValue
        const oldStrLength = oldStr.length
        const newStrLength = newStr.length
        if (newStrLength > 15) return false;
        if (newStrLength <= oldStrLength) {
            // Xoá
            return true
        } else if (/^[0-9.,]*[.,]$/.test(newStr)) {
            // Thêm character && có chứa dấu chấm, dấy phẩy
            return false
        } else {
            return true
        }
    }

    validateTargetValue(newTargetValue) {
        switch (this.dic.alertType.key) {
            case ALERT_TYPE.LAST_PRICE.key:
            case ALERT_TYPE.BID_PRICE.key:
            case ALERT_TYPE.OFFER_PRICE.key:
                return this.validatePrice(newTargetValue)
            case ALERT_TYPE.CHANGE_POINT.key:
                return this.validatePercent(newTargetValue, false)
            case ALERT_TYPE.CHANGE_PERCENT.key:
                return this.validatePercent(newTargetValue, true)
            case ALERT_TYPE.TODAY_VOLUME.key:
                return this.validateVolume(newTargetValue)
            default:
                return true
        }
    }

    onChangeTargetValue(targetValue) {
        this.updateDisableButtonConfirm(false)
        this.resetError()
        targetValue = Util.removeZeroCharacterAtStart(targetValue)
        const validate = this.validateTargetValue(targetValue)
        if (validate) {
            targetValue = Util.removeCommaCharacter(targetValue)
            targetValue = Util.removeSpaces(targetValue)
            this.dic.targetValue = targetValue
            this.refInput && this.refInput.setNativeProps({
                text: targetValue
            })
            this.setState({ targetValue })
        } else {
            let targetValue = this.dic.targetValue.toString()
            targetValue = Util.removeZeroCharacterAtStart(targetValue)
            this.refInput && this.refInput.setNativeProps({
                text: targetValue
            })
            this.setState({ targetValue })
        }
    }
    getMeasure = (event, key) => {
        const topModalHomeScreen = event.nativeEvent.layout.y + event.nativeEvent.layout.height
        // this.dic.listPicker[key] = topModalHomeScreen
        this.dic.listPicker[key] = {
            top: topModalHomeScreen,
            height: event.nativeEvent.layout.height
        }
    }
    addRef = (ref, key) => {
        this.dic.listRefPicker[key] = ref
    }
    renderPicker({ title, value, editable, onChangeText, onPress, numberCount, type }) {
        const isYesSetPrice = value === 'Yesterday Settlement Price';
        const styleEditAble = CommonStyle.selectedText
        const styleViewOnly = {
            fontFamily: CommonStyle.fontPoppinsRegular, // Font nay loi tren android. Loi che 1 phan text khi text qua dai
            // opacity: CommonStyle.opacity1,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.colorProduct,
            textAlign: 'right'
        }
        let keyboardType = Platform.select({ ios: 'numbers-and-punctuation', android: 'numeric' });
        if (this.dic.alertType.key !== ALERT_TYPE.CHANGE_PERCENT.key && this.dic.alertType.key !== ALERT_TYPE.CHANGE_POINT.key) {
            keyboardType = 'numeric'
        }
        return <View renderToHardwareTextureAndroid={true} ref={ref => this.addRef(ref, type)} style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
        }}>
            <View style={{ flex: 1, justifyContent: 'center', height: 32 }}>
                <Text style={[CommonStyle.textNewOrder, {
                    opacity: 1,
                    textAlign: 'left'
                }]}>
                    {
                        numberCount
                            ? `${title} (${numberCount})`
                            : title
                    }
                </Text>
            </View>

            <TouchableOpacityOpt
                setRef={ref => this.refWrapperInput = ref}
                onPress={onPress}
                style={[
                    CommonStyle.pickerContainer,
                    {
                        width: 216,
                        height: 32,
                        borderRadius: 48,
                        borderWidth: 1,
                        borderColor: CommonStyle.color.dusk,
                        justifyContent: 'flex-end',
                        paddingRight: 16
                    }]}>
                <View style={{ paddingLeft: 16, width: '97%', alignItems: 'flex-end' }}>
                    {
                        editable
                            ? <TextInput
                                type='text'
                                onFocus={this.onFocus}
                                onBlur={this.onBlur}
                                testID={``}
                                editable={editable}
                                ref={ref => this.refInput = ref}
                                keyboardType={keyboardType}
                                underlineColorAndroid='transparent'
                                value={value}
                                style={styleEditAble}
                                onChangeText={onChangeText} />
                            : <View style={{
                                backgroundColor: 'transparent',
                                width: isYesSetPrice ? '100%' : '98%',
                                paddingRight: 16
                            }}>
                                <Text
                                    numberOfLines={1}
                                    style={styleViewOnly}>
                                    {value}
                                </Text>
                            </View>
                    }
                </View>
                {
                    editable && this.dic.alertType.key === ALERT_TYPE.CHANGE_PERCENT.key
                        ? <Text style={{ color: CommonStyle.colorProduct, paddingRight: 2, fontSize: CommonStyle.fontSizeM * CommonStyle.fontRatio }}>{'%'}</Text>
                        : null
                }
                {
                    this.dic.alertType.key !== ALERT_TYPE.LAST_PRICE.key &&
                        this.dic.alertType.key !== ALERT_TYPE.NEWS.key &&
                        title === I18n.t('targetPriceLabel')
                        ? null
                        : <Ionicons name='ios-arrow-forward' style={CommonStyle.iconPickerDown} />
                }
            </TouchableOpacityOpt>
        </View >
    }

    renderAlertType() {
        const title = I18n.t('alertTypeLabel')
        const value = I18n.t(this.dic.alertType.key)
        const editable = false
        const onPress = this.onPressAlertType
        return this.renderPicker({ title, value, editable, onPress, type: TYPE_PICKER.ALERT_TYPE })
    }

    renderTrigger() {
        const title = I18n.t('triggerLabel')
        const value = I18n.t(this.dic.trigger.key)
        const editable = false
        const onPress = this.dic.alertType.key === ALERT_TYPE.NEWS.key ? this.onPressNewsTrigger : this.onPressPriceTrigger
        return this.renderPicker({ title, value, editable, onPress, type: TYPE_PICKER.ALERT_TRIGGER })
    }

    renderTarget() {
        if (this.dic.alertType === ALERT_TYPE.NEWS) {
            return this.renderTargetNews()
        }
        return this.renderTargetPrice()
    }

    renderTargetNews() {
        const editable = false
        const title = I18n.t('titleSelectTargetNews')
        const value = this.getTagNewUI()
        const numberCount = this.getNumberCountTargetNew()
        const onPress = this.onPressTargetNews
        return this.renderPicker({ title, value, editable, onPress, numberCount, type: TYPE_PICKER.ALERT_TARGET_NEW })
    }

    renderTargetPrice() {
        const editable = this.checkEditAble()
        const title = I18n.t('targetPriceLabel')
        const value = this.formatTargetPrice(editable)
        const onPress = this.onPressTargetPrice
        const onChangeText = this.onChangeTargetValue
        return this.renderPicker({ title, value, editable, onPress, onChangeText, type: TYPE_PICKER.ALERT_TARGET_PRICE })
    }

    renderRepeat() {
        if (this.dic.alertType === ALERT_TYPE.NEWS) {
            const editable = this.checkEditAble()
            const title = I18n.t('repeatNewsLabel')
            const value = I18n.t(this.dic.repeat.key)
            const onPress = this.onPressNewsRepeat
            return this.renderPicker({ title, value, editable, onPress, type: TYPE_PICKER.ALERT_REPEAT })
        }
        return null
    }

    updateDisableButtonConfirm(disable) {
        // const { isModify } = this.props
        // if (!isModify) return // Case new alert: Khi  confirm loi-> disable when change taget value not enable button
        this.dic.refDeliveryMethod && this.dic.refDeliveryMethod.updateDisableButtonConfirm(disable)
    }

    render() {
        return (
            <React.Fragment>
                <KeyboardAvoidingView
                    behavior={'padding'}>
                    <View style={{ width, height: 24 }} />
                    {this.renderAlertType()}
                    {this.renderTrigger()}
                    {this.renderTarget()}
                    {this.renderRepeat()}

                    <DeliveryMethod
                        onRef={ref => this.dic.refDeliveryMethod = ref}
                        isModify={this.props.isModify}
                        deliveryMethodEmail={this.dic.deliveryMethodEmail}
                        deliveryMethodNotification={this.dic.deliveryMethodNotification}
                        onCreateAlert={this.onCreateAlert}
                        onModifyAlert={this.onModifyAlert}
                        updateDeliveryMethod={this.updateDeliveryMethod} />
                </KeyboardAvoidingView>
            </React.Fragment>
        )
    }
}
