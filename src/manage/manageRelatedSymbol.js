import { dataStorage } from '../storage';
import * as Emitter from '@lib/vietnam-emitter'

export function getDicSymbolRelated() {
    const dicRelated = dataStorage.dicRelatedSymbol;
    console.log('dic symbol related ==============', dicRelated);
    return dicRelated;
}
export function updateSymbolWatchlist() {
    try {
        const dicWL = dataStorage.dicWatchlist || {};
        const listKey = Object.keys(dicWL) || [];
        if (!listKey.length) return '';
        const temp1 = {}
        for (let i = 0; i < listKey.length; i++) {
            const listSymbol = dicWL[listKey[i]].value
            for (let j = 0; j < listSymbol.length; j++) {
                temp1[listSymbol[j].symbol] = true;
            }
        }
        dataStorage.listSymbolWatchList = Object.keys(temp1) || [];
        mergePositionWithWatchList();
    } catch (error) {
        console.log('error updateSymbolWatchlist', error)
    }
}
export function updateSymbolPortfolio() {
    try {
        const dicPO = Object.keys(dataStorage.dicPosition || {});
        // console.log('==========================> ', dicPO)
        // const listPosition = dicPO.positions || [];
        // const dicSymbol = []
        // if (listPosition && listPosition.length) {
        //     for (let i = 0; i < listPosition.length; i++) {
        //         dicSymbol.push(listPosition[i].symbol || '')
        //     }
        // }
        dataStorage.listSymbolPortfolio = dicPO;
        mergePositionWithWatchList();
    } catch (error) {
        console.log('error updateSymbolPortfolio', error)
    }
}
function arrayUnique(array) {
    try {
        return [...new Set(array)]
    } catch (error) {
        console.log('error arrayUnique', error)
    }
}

export function mergePositionWithWatchList(data) {
    try {
        const dicWL = dataStorage.listSymbolWatchList || [];
        const dicPO = dataStorage.listSymbolPortfolio || [];
        const mergeArray = arrayUnique([...dicWL, ...dicPO]);
        dataStorage.dicRelatedSymbol = mergeArray;
        console.log('===========================dic Related after merge====================', mergeArray)
    } catch (error) {
        console.log('error mergePositionWithWatchList', error)
    }
}
export function updateDicSymbolRelated(isFrom, data, action) {
    try {
        let arrOldData = dataStorage.dicRelatedSymbol;
        let arrNewData = []
        switch (isFrom) {
            case 'WATCH_LIST_UPDATE':
                switch (action) {
                    case '':
                    case 'add':
                        arrNewData = data && data.value && Array.isArray(data.value) && data.value.map(el => el.symbol)
                        break;
                    case 'remove':
                        const tmp = data && data.value && Array.isArray(data.value) && data.value.map(el => el.symbol)
                        arrOldData = arrOldData.filter(function (e) {
                            return !(tmp.indexOf(e) > -1);
                        })
                        break;
                    default:
                        break;
                }
                break;
            case 'WATCH_LIST_INSERT':
            case 'WATCH_LIST_DELETE':
                // arrNewData = Object.keys((data && data.value) || {});
                break;
            case 'PORTFOLIO':
                const listPosition = data.positions;
                if (listPosition && listPosition.length) {
                    listPosition.map(item => arrNewData.push(item.symbol))
                }
                break;
            default:
                break;
        }
        const mergeArray = arrayUnique([...arrNewData, ...arrOldData]);
        dataStorage.dicRelatedSymbol = mergeArray;
        console.log('===========================dic Related after merge====================', mergeArray)
    } catch (error) {
        console.log('error mergePositionWithWatchList', error)
    }
}
