import React, { useEffect } from 'react'
import { getChannelShowErrorSystem, getChannelHideErrorSystem } from '~/streaming/channel.js'
import * as Emitter from '@lib/vietnam-emitter';
const channelShowError = getChannelShowErrorSystem()
const channelHideErrorSystem = getChannelHideErrorSystem()
export function useListenerShowError({ showError = () => { } }) {
    return useEffect(() => {
        const id = Emitter.addListener(channelShowError, null, showError)
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
export function useListenerHideError({ hideError = () => { } }) {
    return useEffect(() => {
        const id = Emitter.addListener(channelHideErrorSystem, null, ({ isUpdateLoading = true }) => hideError({ isUpdateLoading }))
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
