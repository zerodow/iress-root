import React, { Component } from 'react'
import * as Emitter from '@lib/vietnam-emitter'
import XComponent from '../xComponent/xComponent'
import * as PureFunc from '../../utils/pure_func'
import PropTypes from 'prop-types'

export default class xButtonMinion extends XComponent {
    static propTypes = {
        component: PropTypes.object.isRequired,
        style: PropTypes.object,
        onPress: PropTypes.func,
        channelGroup: PropTypes.string,
        stagnantTime: PropTypes.number,
        disabled: PropTypes.bool
    }

    bindAllFunc() {
        this.subChannelGroup = this.subChannelGroup.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    init() {
        this.dic = {
            style: this.props.style || {},
            onPress: this.props.onPress || PureFunc.emptyFunc(),
            active: true,
            handleTimeout: null
        }

        this.subChannelGroup()
    }

    subChannelGroup() {
        this.props.stagnantTime &&
            this.props.channelGroup &&
            Emitter.addListener(this.props.channelGroup, this.id, () => {
                this.handleTimeout && clearTimeout(this.handleTimeout)
                this.dic.active = false
                this.handleTimeout = this.setTimeout(() => {
                    this.dic.active = true
                }, this.props.stagnantTime)
            })
    }

    onClick() {
        if (this.dic.active === false) return
        this.props.channelGroup && Emitter.emit(this.props.channelGroup, this.id)
        this.dic.onPress()
    }

    render() {
        const Button = this.props.component
        const props = {
            onPress: this.onClick,
            style: this.dic.style
        }

        if (this.props.disabled != null) props.disabled = this.props.disabled
        return (
            <Button {...props} />
        )
    }
}
