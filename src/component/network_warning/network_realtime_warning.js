import React from 'react'
import NetworkWarning from './network_warning'
import XComponent from '../xComponent/xComponent'

export default class NetworkWarningRealtime extends XComponent {
    init() {
        this.xSubConnectionChange()
    }

    onConnectionChange() {
        this.setState()
    }

    render() {
        return this.isConnected
            ? null
            : <NetworkWarning />
    }
}
