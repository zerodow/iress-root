// Quản lý current account && previous account details
import ENUM from '../enum'
let preAccDetails = {}
let currentAccDetails = {}

export function setPreAccDetails(details) {
    preAccDetails = details
}

export function getPreAccDetails() {
    return preAccDetails
}

export function setCurAccDetails(details) {
    currentAccDetails = details
}

export function getCurAccDetails() {
    return currentAccDetails
}

export function checkPreAccActive() {
    return preAccDetails.status === ENUM.ACCOUNT_STATE.ACTIVE
}

export function checkCurAccActive() {
    return currentAccDetails.status === ENUM.ACCOUNT_STATE.ACTIVE
}

export function checkPreAccInActive() {
    return preAccDetails.status === ENUM.ACCOUNT_STATE.INACTIVE
}

export function checkCurAccInActive() {
    return currentAccDetails.status === ENUM.ACCOUNT_STATE.INACTIVE
}
