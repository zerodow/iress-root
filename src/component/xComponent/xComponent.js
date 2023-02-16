import React, { Component } from 'react'
import { Text, PixelRatio } from 'react-native'
import PropTypes from 'prop-types'
import Uuid from 'react-native-uuid'
import * as Emitter from '@lib/vietnam-emitter'
import * as Controller from '../../memory/controller'
import * as Channel from '../../streaming/channel'
import * as PureFunc from '../../utils/pure_func'

const dicFuncLifeCycle = {
    render: true,
    setState: true,
    bindAllFunc: true,
    forceUpdate: true,
    constructor: true,
    componentDidCatch: true,
    componentDidMount: true,
    componentWillMount: true,
    componentDidUpdate: true,
    componentWillUpdate: true,
    componentWillUnmount: true,
    shouldComponentUpdate: true,
    getSnapshotBeforeUpdate: true,
    UNSAFE_componentWillMount: true,
    componentWillReceiveProps: true,
    UNSAFE_componentWillUpdate: true,
    UNSAFE_componentWillReceiveProps: true
}

export default class XComponent extends Component {
    static propTypes = {
        autoControlExpand: PropTypes.bool,
        autoControlRender: PropTypes.bool,
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        expandInfo: PropTypes.shape({
            isExpand: PropTypes.bool,
            channelExpandingChange: PropTypes.string
        }),
        allowRenderInfo: PropTypes.shape({
            fnGetAllowRender: PropTypes.func,
            channelAllowRender: PropTypes.string
        })
    }

    constructor(props, params = {}) {
        super(props)

        this.bindAllFunc = this.bindAllFunc.bind(this)
        this.bindAllFunc()

        //  init parameter
        this.dic = {}
        this.id = Uuid.v4()
        this.isMount = false
        this.screenName = null
        this.xSetting = params
        this.listTimeout = null
        this.listInterval = null
        this.xWaitRender = false
        this.xCbAfterRender = null
        this.parentID = props.parentID
        this.xOnChangeAllowRender = null
        this.isExpand = this.props.autoControlExpand && this.props.expandInfo
            ? PureFunc.getBooleanable(this.props.expandInfo.isExpand, false)
            : false
        this.isConnected = Controller.getConnectionStatus()
        this.xAllowRender = this.props.autoControlRender &&
            this.props.indexInList &&
            this.props.allowRenderInfo &&
            this.props.allowRenderInfo.fnGetAllowRender
            ? this.props.allowRenderInfo.fnGetAllowRender(this.props.indexInList)
            : true

        //  init
        this.parentID && Emitter.addChildPTC(this.parentID, this.id, this.onParentCall)
        this.xSetNavEventOnThisForm()
        this.subChangeTheme()
        this.xSubChannelAllowRender()
        this.xSubChannelExpandingChange()

        this.init()
    }

    //  #region ALLOW RENDER, EXPAND
    onOtherItemExpand() { }
    onConnectionChange() { }

    xSubChannelAllowRender() {
        const channelAllowRender = this.props.allowRenderInfo
            ? this.props.allowRenderInfo.channelAllowRender
            : null

        this.props.autoControlRender &&
            this.props.indexInList &&
            channelAllowRender &&
            Emitter.addListener(channelAllowRender, this.id, dicAllow => {
                const newAllow = dicAllow[this.props.indexInList]
                if (newAllow == null || newAllow === this.xAllowRender) return

                this.xAllowRender = newAllow
                if (this.xAllowRender && this.xWaitRender) {
                    this.xWaitRender = false
                    const cb = this.xCbAfterRender
                    this.xCbAfterRender = null

                    if (this.xOnChangeAllowRender) {
                        this.xOnChangeAllowRender(this.xAllowRender, cb)
                    } else {
                        cb
                            ? this.setState({}, cb)
                            : this.setState()
                    }
                }
            })
    }

    xSetFnAllowRender(fn) {
        this.xOnChangeAllowRender = fn
    }

    xGetAllowRender() {
        return this.xAllowRender
    }

    xOnExpand(status) {
        if (status) {
            this.isExpand = true

            const channelExpandingChange = this.props.expandInfo
                ? this.props.expandInfo.channelExpandingChange
                : null
            this.props.autoControlExpand &&
                this.props.indexInList &&
                channelExpandingChange &&
                Emitter.emit(channelExpandingChange, this.id)
        } else {
            this.isExpand = false
        }
    }

    xSubChannelExpandingChange() {
        const channelExpandingChange = this.props.expandInfo
            ? this.props.expandInfo.channelExpandingChange
            : null

        this.props.autoControlExpand &&
            this.props.indexInList &&
            channelExpandingChange &&
            Emitter.addListener(channelExpandingChange, this.id, idOpener => {
                if (idOpener === this.id || !this.isExpand) return
                this.isExpand = false
                this.onOtherItemExpand()
            })
    }

    xSubConnectionChange() {
        const channelName = Channel.getChannelConnectionChange()
        Emitter.addListener(channelName, this.id, isConnected => {
            if (this.isConnected === isConnected) return
            this.isConnected = isConnected
            this.onConnectionChange()
        })
    }
    //  #endregion

    //  #region BASE FUNC
    init() { }
    bindAllFunc() {
        /* eslint-disable */
        const listFunc = [
            ...Object.getOwnPropertyNames(this.__proto__),
            ...Object.getOwnPropertyNames(this.__proto__.__proto__)
        ]
        /* eslint-enable */
        listFunc.map(funcName => {
            this[funcName] = this[funcName].bind(this)
        })
    }
    componentWillMount() { }
    componentWillReceiveProps() { }
    componentWillUpdate() { }
    componentDidUpdate() { }
    componentDidCatch() { }
    shouldComponentUpdate() {
        return true
    }
    componentDidMount() {
        this.isMount = true
    }
    componentWillUnmount() {
        //  mount
        this.isMount = false
        this.parentID && this.onParentCall && Emitter.removeChildPTC(this.parentID, this.id)

        //  show hide app
        this.stateApp && this.stateApp.removeHandler()
        this.stateApp = null

        //  timeout
        this.listTimeout &&
            this.listTimeout.map(handle => clearTimeout(handle))

        //  interval
        this.listInterval &&
            this.listInterval.map(handle => clearInterval(handle))

        //  emitter
        Emitter.deleteByIdEvent(this.id)
        this.dic = {}
    }
    //  #endregion

    //  #region PUB AND SUB
    subChangeTheme() {
        Emitter.addListener(Channel.getChannelChangeTheme(), this.id, this.onThemeChange)
    }
    //  #endregion

    //  #region COMMUNICATION
    onParentCall() { }
    emitToChild(param) {
        Emitter.parentEmitPTC(this.id, param)
    }
    emitAndWaitToChild(param) {
        Emitter.parentEmitPTC(this.id, param, true)
    }
    //  #endregion

    //  #region UTIL
    setScreen(screenName) {
        this.screenName = screenName
    }
    isShowingHere() {
        return Controller.isCurrentScreen(this.screenName)
    }
    setTimeout(cb, time) {
        const handle = setTimeout(cb, time)
        this.listTimeout = this.listTimeout || []
        this.listTimeout.push(handle)
        return handle
    }
    setInterval(cb, time) {
        const handle = setInterval(cb, time)
        this.listInterval = this.listInterval || []
        this.listInterval.push(handle)
        return handle
    }
    //  #endregion

    //  #region NAV
    xSetNavEventOnThisForm() {
        !this.xSetting.ignoreNavEvent &&
            this.props.navigator &&
            this.onNavigatorEvent &&
            this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    }
    onNavEvent(event) {
        if (!event || event.type === 'DeepLink' || event.type === 'NavBarButtonPress') return

        switch (event.id) {
            case 'didAppear':
                Controller.isCurrentScreen(this.screenName)
                break;
            case 'didDisappear':
                Controller.isCurrentScreen(null)
                break;
            default:
                break;
        }
    }
    clearRightBtnNav() {
        this.props.navigator && this.props.navigator.setButtons({
            rightButtons: []
        })
    }
    clearLeftBtnNav() {
        this.props.navigator && this.props.navigator.setButtons({
            leftButtons: []
        })
    }
    setRightBtnNav(rightButtons = []) {
        this.props.navigator && this.props.navigator.setButtons({ rightButtons })
    }
    setLeftBtnNav(leftButtons = []) {
        this.props.navigator && this.props.navigator.setButtons({ leftButtons })
    }
    xSetSubtitleNav(subtitle) {
        this.props.navigator && this.props.navigator.setSubTitle({ subtitle })
    }
    xSetTitleNav(title) {
        this.props.navigator && this.props.navigator.setTitle({ title })
    }
    //  #endregion

    //  #region UPDATE UI
    onThemeChange() { }
    setState(obj = {}, cb) {
        if (!this.isMount) return
        if (this.xAllowRender) {
            super.setState(obj, cb)
        } else {
            this.state = {
                ...this.state,
                obj
            }
            this.xWaitRender = true
            this.xCbAfterRender = cb || null
        }
    }
    setStateLowPriority(obj = {}, cb) {
        this.setState(obj, cb) // Viec de timeout lam cho hanh dong update bi xep sau cac js khac => hien thi du lieu khong xuat hien deu nhau
    }
    forceUpdate(cb) {
        this.isMount && super.forceUpdate(cb)
    }
    forceUpdateLowPriority(cb) {
        this.forceUpdate(cb)
    }
    forceSetState(obj = {}, cb) {
        this.state = {
            ...this.state,
            ...obj
        }
        this.forceUpdate(cb)
    }
    //  #endregion
}
