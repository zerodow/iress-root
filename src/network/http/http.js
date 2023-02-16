import * as Str from '../../constants/text'
import * as PureFunc from '../../utils/pure_func'
import Enum from '../../enum'
import RNFetchBlob from 'rn-fetch-blob'
import DeviceInfo from 'react-native-device-info'
import { dataStorage } from '~/storage'

const METHOD = Enum.METHOD
const JSON = PureFunc.json

function createHeaders(token) {
    return { 'Authorization': `bearer ${token}` }
}

function createOption(option) {
    const body = [option.method, option.url]

    const header = option.notHeader || !option.token
        ? {}
        : createHeaders(option.token)
    header['user-agent'] = dataStorage.userAgent
    if (option.method !== METHOD.GET) header['Content-Type'] = 'application/json'
    body.push(header)

    option.data && body.push(JSON.stringify(option.data))

    const config = { trusty: true }
    if (option.timeout) config.timeout = option.timeout

    return {
        body,
        config
    }
}

function isTimeout(errorMessage) {
    return errorMessage && errorMessage.message === 'The request timed out.'
}

function send({ option, cbSuccess, cbError }) {
    const { body, config } = createOption(option)

    const startTime = new Date().getTime()
    const logStart = Str.getTxt('logStartReq', option.method, option.url, JSON.stringify(option.data || {}))
    !option.notLogStart && console.log(logStart)

    RNFetchBlob
        .config(config)
        .fetch(...body)
        .then((res) => {
            const statusCode = res.info().status
            if (statusCode >= 200 && statusCode < 300) {
                const data = JSON.parse(res.data) || res.data
                const timeSpend = new Date().getTime() - startTime
                const logSuccess = Str.getTxt('logReqSuccess', option.method, option.url, timeSpend, JSON.stringify(data))
                !option.notLogSuccess && console.log(logSuccess)

                cbSuccess(data)
            } else {
                return Promise.reject({ message: `statusCode: ${statusCode}` })
            }
        }).catch(errorMessage => {
            const timeSpend = new Date().getTime() - startTime
            const logFail = Str.getTxt('logReqFail', option.method, option.url, timeSpend, errorMessage.message)
            console.log('HTTP REQUEST FAIL', logFail)

            isTimeout(errorMessage) && option.reSend
                ? send({ option, cbSuccess, cbError })
                : cbError(errorMessage)
        })
}
function requesting(option) {
    return new Promise((resolve, reject) => send({
        option,
        cbSuccess: resolve,
        cbError: reject
    }))
}

//  #region EXTERNAL FUNCTION
/*
    option = {
        url: string, require,
        token: string, defaul: current token,
        data: any, defaul: null,
        timeout: number, defaul: null,
        reSend: Boolean, defaul: false,
        notHeader: Boolean, defaul: false
        bypassLog: Boolean, defaul: false,
        responseType: String, default: null,
        notLogStart: Boolean,
        notLogSuccess: Boolean
    }
*/
export function get(option) {
    option.method = METHOD.GET
    return requesting(option)
}

export function post(option) {
    option.method = METHOD.POST
    return requesting(option)
}

export function put(option) {
    option.method = METHOD.PUT
    return requesting(option)
}

export function del(option) {
    option.method = METHOD.DELETE
    return requesting(option)
}
//  #endregion
