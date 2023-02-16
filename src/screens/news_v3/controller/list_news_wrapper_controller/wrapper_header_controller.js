
import * as Api from '~/api.js'
import { Dimensions } from 'react-native'
import { forEach, size, map } from 'lodash'
import RNFetchBlob from 'rn-fetch-blob'
import AsyncStorage from '~/manage/manageLocalStorage'
import Axios from 'axios';
import * as Controller from '~/memory/controller'
import CommonStyle, { register } from '~/theme/theme_controller'
import { Navigation } from 'react-native-navigation';
import { TIME_IRESS } from '~/constants/news.js'
import { TYPE } from '~/component/picker_news/constants.js'
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
const { width: DEVICE_WIDTH } = Dimensions.get('window')
let dirs = RNFetchBlob.fs.dirs
const TIMEOUT_REQUEST = 10000;
function formatDataVendor(data = {}) {
    return map(data, (el, key) => {
        return {
            label: el.vendor_description,
            value: el.vendor_code
        }
    })
}
export const showVendor = async ({
    size,
    search,
    renderIcon
}) => {
    try {
        const data = HeaderModel.getDataVendor()

        const onSelectedDone = (selectedValue) => {
            const oldListVendorId = JSON.stringify(HeaderModel.getListVendorId())
            HeaderModel.setListVendorId(selectedValue)
            const newListVendorId = JSON.stringify(selectedValue)
            if (oldListVendorId === newListVendorId) return HeaderModel.setChangeVendor(false)
            HeaderModel.setChangeVendor(true)
            search && search()
        }
        let right = null
        if (size) {
            const { w, pX } = size
            right = DEVICE_WIDTH - pX - 16 - (w - 16 * 2) // Padding horizontal 16 => width thực = w - 16 - 16
        }
        const dataCv = formatDataVendor(data)
        if (dataCv.length === 0) return
        Navigation.showModal({
            screen: 'equix.PickerNews',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                type: TYPE.WITHOUT_PARENT,
                size,
                data: dataCv,
                right,
                onSelectedDone,
                labelItemAll: 'All Vendors',
                selectedValue: HeaderModel.getListVendorId(),
                renderIcon
            }
        })
    } catch (error) {
        return true
    }
}
export function getParent(data) {
    let result = {}
    forEach(data, (el, key) => {
        if (el.isParent) {
            result[key] = {
                ...el,
                children: [],
                label: el.category_name,
                value: el.category_id
            }
        }
    })
    return result
}
export function formatDataWithParent2(data = {}, parent = {}) {
    let parentObj = { ...parent }
    forEach(data, (el, key) => {
        let obj = { ...el }
        obj.children = []
        obj.label = obj.category_name
        obj.value = obj.category_id
        /* map[obj.parentcategory_id] = obj */;
        const parentId = obj.parent_category_id
        if (parentId) {
            if (parent[parentId]) {
                parentObj[parentId]['children'] = [...parentObj[parentId]['children'], obj]
            }
        }
    })
    return parentObj;
}
export function formatDataWithParent(data = {}) {
    let map = {};
    // {
    //     'category_id': '105000020',
    //     'parentcategory_id': '105000020',
    //     'category_name': 'Health and Medical parent',
    //     'category_initials': 'HM'
    //     'label': 'Health and Medical',
    //     'value': '105000020',
    //     'children':[{
    //          'category_id': '105000021',
    //          'parentcategory_id': '105000020',
    //          'category_name': 'Health and Medical children',
    //          'category_initials': 'HM'
    //          'label': 'Health and Medical',
    //          'value': '105000020',
    //      }]
    // }
    forEach(data, (el, key) => {
        let obj = { ...el }
        obj.children = []
        obj.label = obj.category_name
        obj.value = obj.category_id
        /* map[obj.parentcategory_id] = obj */;

        let parent = obj.parent_category_id || '-';
        if (map[parent] && parent === obj.category_id) {
            map[parent] = {
                ...obj,
                children: map[parent].children
            }
        } else if (map[parent] && parent !== obj.category_id) {
            map[parent].children.push(obj)
        } else {
            map[parent] = obj
            if (!(parent === obj.category_id)) {
                map[parent].children.push(obj)
            }
        }
    })
    return map;
}
export const showCategory = ({
    size,
    search,
    renderIcon
}) => {
    try {
        // const url = Api.getUrlGetVendorNews()
        // const data = await Api.requestData(url)
        const data = HeaderModel.getDataCategory()
        const parent = getParent(data)
        const dataCv = Object.values(formatDataWithParent2(data, parent))
        const onSelectedDone = (selectedValue) => {
            const oldListCategory = JSON.stringify(HeaderModel.getListCategory())
            const newListCategory = JSON.stringify(selectedValue)
            HeaderModel.setListCategoryId(selectedValue)
            if (oldListCategory === newListCategory) return
            search && search()
        }
        let right = null
        if (size) {
            const { w, pX } = size
            right = DEVICE_WIDTH - pX - 16 - (w - 16 * 2) // Padding horizontal 16 => width thực = w - 16 - 16
        }
        if (dataCv.length === 0) return
        Navigation.showModal({
            screen: 'equix.PickerNews',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                type: TYPE.WITHOUT_PARENT,
                size,
                data: dataCv,
                right,
                onSelectedDone,
                labelItemAll: 'All Categories',
                selectedValue: HeaderModel.getListCategory(),
                renderIcon
            }
        })
    } catch (error) {
        return true
    }
}
export const showDuration = ({
    size,
    setDuration,
    search,
    renderIcon
}) => {
    const onSelectedDone = (selectedValue) => {
        const oldDuration = HeaderModel.getDuration()
        HeaderModel.setDuration(selectedValue)
        // if (selectedValue === HeaderModel.CONSTANTS.DURATION.CUSTOM) return setDuration && setDuration(selectedValue)
        if (oldDuration === selectedValue) return
        search && search()
        setDuration && setDuration(selectedValue)
    }
    let right = null
    if (size) {
        const { w, pX } = size
        right = DEVICE_WIDTH - pX - 16 - (w - 16 * 2) // Padding horizontal 16 => width thực = w - 16 - 16
    }
    Navigation.showModal({
        screen: 'equix.PickerNews',
        animated: false,
        animationType: 'none',
        navigatorStyle: {
            ...CommonStyle.navigatorModalSpecialNoHeader,
            modalPresentationStyle: 'overCurrentContext'
        },
        passProps: {
            size,
            right,
            data: TIME_IRESS,
            selectedValue: HeaderModel.getDuration(),
            onSelectedDone,
            renderIcon
        }
    })
}
export async function getDataVendor() {
    try {
        try {
            const url = Api.getUrlGetVendorNews()
            const data = await Api.requestData(url)
            fetchImageVendor(data)
            HeaderModel.setDataVendor(data)
        } catch (error) {
            HeaderModel.setDataVendor([])
        }
    } catch (error) {
        console.log('Data')
    }
}
export function downLoadAndSaveImage(pathDir, listVendor) {
    let listPromise = []
    const { config, fs } = RNFetchBlob;

    for (let index = 0; index < listVendor.length - 1; index++) { // Bo qua key common trong file config
        const element = listVendor[index];
        // if (index === listVendor.length - 1) return // Bo qua key common trong file config
        const vendorCode = element['key'].toLowerCase();
        const type = element['type'] || 'text'
        if (type === 'image') {
            let url = `https://dev1.equixapp.com/img/vendor-logo/${vendorCode}.png`
            let path = `${pathDir}/${vendorCode}.png`
            // Check file exists
            listPromise.push(new Promise((resolve) => {
                fs.exists(path).then((exists) => {
                    if (exists) {
                        resolve()
                    } else {
                        let options = {
                            fileCache: false,
                            path: path
                        };
                        config(options)
                            .fetch('GET', url, {
                                'Cache-Control': 'no-store'
                            })
                            .then(res => {
                                if (res.path()) {
                                    resolve()
                                } else {
                                    resolve()
                                }
                            });
                    }
                })
            }))
        }
    }
    return listPromise
}
const fakeConfig = {
    'abn': {
        'name': 'ABN News Wire',
        'key': 'abn',
        'logo': '/img/vendor-logo/abn.png',
        'type': 'image'
    },
    'asxh': {
        'name': 'ASX Header',
        'key': 'asxh',
        'logo': '/img/vendor-logo/asxh.png',
        'type': 'image'
    },
    'brr': {
        'name': 'BRR - Boardroom Radio',
        'key': 'brr',
        'logo': '/img/vendor-logo/brr.png',
        'type': 'image'
    },
    'ccn': {
        'name': 'Marketwire',
        'key': 'ccn',
        'logo': '/img/vendor-logo/ccn.png',
        'type': 'image'
    },
    'cxan': {
        'name': 'Chi-X Australia News',
        'key': 'cxan',
        'logo': '/img/vendor-logo/cxan.png',
        'type': 'image'
    },
    'dbxn': {
        'name': 'Deutsche Bourse Market News',
        'key': 'dbxn',
        'logo': '/img/vendor-logo/dbxn.png',
        'type': 'image'
    },
    'edn': {
        'name': 'Edison News',
        'key': 'edn',
        'logo': '/img/vendor-logo/edn.png',
        'type': 'image'
    },
    'edtvn': {
        'name': 'Edison TV News',
        'key': 'edtvn',
        'logo': '/img/vendor-logo/edtvn.png',
        'type': 'image'
    },
    'erxn': {
        'name': 'Euronext Market News',
        'key': 'erxn',
        'logo': '/img/vendor-logo/erxn.png',
        'type': 'image'
    },
    'g': {
        'name': 'ASX Company Reports - Signal G',
        'key': 'g',
        'logo': '/img/vendor-logo/g.png',
        'type': 'image'
    },
    'ire': {
        'name': 'IRESS Information Announcements',
        'key': 'ire',
        'logo': '/img/vendor-logo/ire.png',
        'type': 'image'
    },
    'irp': {
        'name': 'IR Plus Exchange News',
        'key': 'irp',
        'logo': '/img/vendor-logo/irp.png',
        'type': 'image'
    },
    'lwm': {
        'name': 'Livewire',
        'key': 'lwm',
        'logo': '/img/vendor-logo/lwm.png',
        'type': 'image'
    },
    'nsx': {
        'name': 'NSX Company Reports',
        'key': 'nsx',
        'logo': '/img/vendor-logo/nsx.png',
        'type': 'image'
    },
    'omxn': {
        'name': 'OMX Market News',
        'key': 'omxn',
        'logo': '/img/vendor-logo/omxn.png',
        'type': 'image'
    },
    'opbr': {
        'name': 'Open Briefing',
        'key': 'opbr',
        'logo': '/img/vendor-logo/opbr.png',
        'type': 'image'
    },
    'pds': {
        'name': 'ASX CommNews - PDF',
        'key': 'pds',
        'logo': '/img/vendor-logo/pds.png',
        'type': 'image'
    },
    'rcrn': {
        'name': 'RCR News',
        'key': 'rcrn',
        'logo': '/img/vendor-logo/rcrn.png',
        'type': 'image'
    },
    'sps': {
        'name': 'South Pacific Stock Exchange Comp Rep',
        'key': 'sps',
        'logo': '/img/vendor-logo/sps.png',
        'type': 'image'
    },
    'fnn': {
        'name': 'Finance News Network',
        'key': 'fnn',
        'type': 'text'
    },
    'anuk': {
        'name': 'Alliance News UK Professional',
        'key': 'anuk',
        'type': 'text'
    },
    'common': {
        'version': '20200515'
    }
}
export function fetchImageVendor(listVendor = [], cb) {
    const { config, fs } = RNFetchBlob;
    const url = 'https://dev1.equixapp.com/news-vendor.json'
    Axios({
        url,
        method: 'get',
        headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${Controller.getAccessToken()}`
        },
        timeout: TIMEOUT_REQUEST
    }).then(async res => {
        if (res.status === 200) {
            if (res.data) {
                const data = res.data;
                HeaderModel.setVendorConfig(data)
                const { common } = data
                const version = common.version
                const listVendorConfig = Object.values(data)
                try {
                    let newsVendorConfig = await AsyncStorage.getItem('newsVendorConfig')
                    newsVendorConfig = JSON.parse(newsVendorConfig)
                    const preVersion = newsVendorConfig.common.version
                    let isUpdate = version !== preVersion
                    // Neu version khac nhau thi download lai anh
                    if (isUpdate) {
                        AsyncStorage.setItem('newsVendorConfig', JSON.stringify(data))
                        handleDownLoadImageVendor(listVendorConfig)
                    }
                } catch (error) {
                    // Lan dau tien chua co newsVendorConfig
                    AsyncStorage.setItem('newsVendorConfig', JSON.stringify(data)).then(() => {
                        handleDownLoadImageVendor(listVendorConfig)
                    })
                }
            }
        } else {
            logDevice('error', `API CHECK NETWORK CONNECTION - URL: ${url} - ERROR STATUS ${res.status}`)
        }
    }).catch(err => {
        logDevice('error', `API CHECK NETWORK CONNECTION ERROR URL: ${url} - ERROR: ${err}`)
    });
}
function handleDownLoadImageVendor(listVendor = []) {
    const { config, fs } = RNFetchBlob;
    const pathFolder = dirs.DocumentDir + '/vendor_image'
    try {
        fs.exists(pathFolder).then((isFolder) => {
            if (isFolder) {
                fs.unlink(pathFolder).then(() => {
                    fs.mkdir(pathFolder)
                        .then(() => {
                            Promise.all(downLoadAndSaveImage(pathFolder, listVendor)).then(() => {
                                cb && cb()
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            } else {
                fs.mkdir(pathFolder)
                    .then(() => {
                        Promise.all(downLoadAndSaveImage(pathFolder, listVendor)).then(() => {
                            cb && cb()
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        })
    } catch (error) {
        console.log(error)
    }
}
export async function getDataCategory() {
    try {
        const url = Api.getUrlGetCategoryNews()
        const data = await Api.requestData(url)
        HeaderModel.setDataCategory(data)
    } catch (error) {

    }
}
