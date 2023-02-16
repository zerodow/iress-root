import React, { Component } from 'react'
import { View } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
import PromptNew from '../../component/new_prompt/prompt_new_2'
import OldPromptNew from '../../component/new_prompt/prompt_new'
import XComponent from '../../component/xComponent/xComponent'
import { dataStorage } from '../../storage'

export default class UserWarning extends XComponent {
    constructor(props) {
        super(props)

        this.noAccount = null
        this.lockPrompt = null
        this.reviewPrompt = null
        this.isShowWarning = false
    }

    showWarning(ref) {
        this.isShowWarning = true
        ref.showModal()
    }

    subChannelShowWarning() {
        this.props.channelShowWarning &&
            Emitter.addListener(
                this.props.channelShowWarning,
                this.id,
                this.showUserWarningPopup)
    }

    showUserWarningPopup() {
        if (dataStorage.isShowNoAccount && dataStorage.isNotHaveAccount) {
            !this.isShowWarning && this.showWarning(this.noAccount)
            dataStorage.isShowNoAccount = false
        } else {
            switch (dataStorage.loginUserType) {
                case loginUserType.LOCKED:
                    !this.dic.isShowWarning && this.showWarning(this.lockPrompt)
                    break;
                case loginUserType.REVIEW:
                    !this.dic.isShowWarning && this.showWarning(this.reviewPrompt)
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
                    onRef={ref => this.noAccount = ref}
                    navigator={this.props.navigator}
                />
                <OldPromptNew
                    type={'lockedAccount'}
                    onRef={ref => this.lockPrompt = ref}
                    navigator={this.props.navigator}
                />
                <OldPromptNew
                    isHideModal={false}
                    type={'reviewAccount'}
                    onRef={ref => this.reviewPrompt = ref}
                    navigator={this.props.navigator}
                />
            </View>
        )
    }
}
