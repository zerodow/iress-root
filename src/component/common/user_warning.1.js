import React, { Component } from 'react'
import { View } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
import PromptNew from '../../component/new_prompt/prompt_new_2'
import OldPromptNew from '../../component/new_prompt/prompt_new'
import XComponent from '../../component/xComponent/xComponent'
import { dataStorage } from '../../storage'
import LoginUserType from '../../constants/login_user_type'

export default class UserWarning extends XComponent {
    bindAllFunc() {
        this.showWarning = this.showWarning.bind(this)
        this.subChannelShowWarning = this.subChannelShowWarning.bind(this)
        this.showUserWarningPopup = this.showUserWarningPopup.bind(this)
    }

    init() {
        this.dic = {
            noAccount: null,
            lockPrompt: null,
            reviewPrompt: null,
            isShowWarning: false
        }

        this.subChannelShowWarning()
    }

    showWarning(ref) {
        this.dic.isShowWarning = true
        ref.showModal()
    }

    subChannelShowWarning() {
        this.props.channelShowWarning &&
            Emitter.addListener(this.props.channelShowWarning, this.id, this.showUserWarningPopup)
    }

    showUserWarningPopup() {
        if (dataStorage.isShowNoAccount && dataStorage.isNotHaveAccount) {
            !this.dic.isShowWarning && this.showWarning(this.dic.noAccount)
            dataStorage.isShowNoAccount = false
        } else {
            switch (dataStorage.loginUserType) {
                case LoginUserType.LOCKED:
                    !this.dic.isShowWarning && this.showWarning(this.dic.lockPrompt)
                    break;
                case LoginUserType.REVIEW:
                    !this.dic.isShowWarning && this.showWarning(this.dic.reviewPrompt)
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        return (
            <View>
                <PromptNew
                    isHideModal={false}
                    type={'noAccount'}
                    onRef={ref => this.dic.noAccount = ref}
                    navigator={this.props.navigator}
                />
                <OldPromptNew
                    type={'lockedAccount'}
                    onRef={ref => this.dic.lockPrompt = ref}
                    navigator={this.props.navigator}
                />
                <OldPromptNew
                    isHideModal={false}
                    type={'reviewAccount'}
                    onRef={ref => this.dic.reviewPrompt = ref}
                    navigator={this.props.navigator}
                />
            </View>
        )
    }
}
