import React, { Component } from 'react';
import { View } from 'react-native';
import * as NewsBusiness from '../../streaming/news'
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '../../util'
import { dataStorage, func } from '../../storage'
import XComponent from '../../component/xComponent/xComponent'
import Enum from '../../enum'

export default class RedDot extends XComponent {
    constructor(props) {
        super(props);

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    init() {
        this.dic = {
            idForm: Util.getRandomKey()
        }
        this.state = {
            readed: true
        }
    }

    bindAllFunc() {
        this.updateNewsReaded = this.updateNewsReaded.bind(this)
        this.initNewsReaded = this.initNewsReaded.bind(this)
    }

    componentDidMount() {
        super.componentDidMount()
        if (this.props.newType === Enum.TYPE_NEWS.RELATED) {
            this.initNewsReaded()
            this.updateNewsReaded()
        }
    }

    componentWillUnmount() {
        if (this.props.newType === Enum.TYPE_NEWS.RELATED) {
            const newID = this.props.newID
            const event = NewsBusiness.getChannelNewsReaded(newID)
            Emitter.deleteListener(event, this.dic.idForm)
        }
        super.componentWillUnmount()
    }

    updateNewsReaded() {
        const newID = this.props.newID
        const event = NewsBusiness.getChannelNewsReaded(newID)
        Emitter.addListener(event, this.dic.idForm, readed => {
            if (this.state.readed !== readed) {
                this.setState({
                    readed
                })
            }
        })
    }

    initNewsReaded() {
        const newID = this.props.newID
        let readed = true;

        if (!dataStorage.dicNewsInday[newID]) { // outside dicNewsInday -> readed
            readed = true;
        } else if (!dataStorage.dicNewsReaded[newID]) { // outside dicNewsReaded -> readed
            readed = false;
        } else if (dataStorage.dicNewsReaded[newID]) { // inside dicNewsReaded -> readed
            readed = true
        }
        this.setState({
            readed
        })
    }

    render() {
        return (
            !this.state.readed && this.props.newType === Enum.TYPE_NEWS.RELATED
                ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#df0000' }} />
                : <View />
        );
    }
}
