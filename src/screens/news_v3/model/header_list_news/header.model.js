import { getStartDay, getEndDay } from '~/lib/base/functionUtil'
import { forEach, size, map, filter as filterObject, pickBy } from 'lodash'
export const CONSTANTS = {
    DURATION: {
        'DAY': 'DAY',
        'WEEK': 'WEEK',
        'MONTH': 'MONTH',
        'QUARTER': 'QUARTER',
        'YEAR': 'YEAR',
        'CUSTOM': 'CUSTOM',
        'ALL': 'ALL'
    }
}
let initValue = {
    listVendorId: {},
    listCategoryId: {},
    duration: CONSTANTS.DURATION.WEEK,
    filter: '',
    fromGTD: getStartDay(-6),
    toGTD: getStartDay(0),
    dataVendor: {},
    dataCategory: {},
    isChangeVendor: false
}
export const resetValue = () => {
    initValue = {
        listVendorId: {},
        listCategoryId: {},
        duration: CONSTANTS.DURATION.WEEK,
        filter: '',
        fromGTD: getStartDay(-6),
        toGTD: getStartDay(0),
        dataVendor: {},
        dataCategory: {},
        vendorConfig: {},
        isChangeVendor: false
    }
}
export function resetTextFilter() {
    initValue.filter = ''
}
export function setChangeVendor(status) {
    initValue.isChangeVendor = status
}
export function checkChangeVendor() {
    return initValue.isChangeVendor
}
export function setVendorConfig(vendorConfig = {}) {
    initValue.vendorConfig = vendorConfig
}
export function getVendorConfig() {
    return initValue.vendorConfig || {}
}
export const setDataVendor = (data = []) => {
    let result = {}
    let selected = {}
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const { vendor_code: vendorCode } = element
        result[vendorCode] = element
        selected[vendorCode] = true
    }
    initValue.dataVendor = result
    initValue.listVendorId = selected
}
export const setDataCategory = (data = []) => {
    let result = {}
    let selected = {}
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const { parent_category_id: parentID, category_id: categoryID } = element
        if (parentID !== null) continue;
        result[categoryID] = {
            ...element,
            isParent: parentID === null
        }
        selected[categoryID] = true
    }
    initValue.listCategoryId = selected
    return initValue.dataCategory = result
}
export const getDataCategory = () => {
    return initValue.dataCategory
}
export const getDataVendor = () => {
    return initValue.dataVendor
}
export const getListDataVendorCode = () => {
    const listDataVendorCode = Object.keys(initValue.dataVendor)
    return listDataVendorCode
}
export const setListVendorId = (vendorIds) => {
    initValue.listVendorId = vendorIds
}
export const getListVendorId = () => initValue.listVendorId
export const getListVendorIdSelected = () => {
    return pickBy(initValue.listVendorId, (value, key) => {
        return value
    })
}

export const setListCategoryId = (categoryIds) => {
    // forEach(categoryIds, (el, key) => {
    //     if (!el) {
    //         delete categoryIds[key];
    //     }
    // })
    return initValue.listCategoryId = categoryIds
}

export const getListCategory = () => initValue.listCategoryId
export const getListCategorySelected = () => {
    return pickBy(initValue.listCategoryId, (value, key) => {
        return value
    })
}

export const setDuration = (duration) => initValue.duration = duration
export const getDuration = () => initValue.duration

export const setFilter = (filter) => initValue.filter = filter
export const getFilter = () => initValue.filter

export const setFromGTD = (fromGTD) => initValue.fromGTD = fromGTD
export const getFromGTD = () => initValue.fromGTD

export const setToGTD = (toGTD) => initValue.toGTD = toGTD
export const getToGTD = () => initValue.toGTD
