import Enum from '../../enum'
/*
    news controller v1: handle all action and return value to use;
    -default value for news;
    -set and get function;
*/
const today = new Date().getTime();
const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
let currentTab = 'relatedNews';
let allDuration = {
    type: 'week',
    from: oneWeekAgo + '',
    to: today + ''
};
let relatedDuration = {
    type: 'week',
    from: oneWeekAgo + '',
    to: today + ''
};
let symbolSearchAll = '';
let symbolSearchRelated = '';
let tagNewsAll = {};
let tagNewsRelated = {};
let pageId = 1;
let loadMore = false;
let loadPage = true;
let dataRelated = [];
let dataAll = [];
let dicPageRelated = [];
let dicPageAll = [];
let isShowNewDetail = false
let totalCountUnread = 0

export function setTotalCountUnRead(count) {
    totalCountUnread = count
}
export function getTotalCountUnRead() {
    return totalCountUnread
}
export function setStatusShowNewDetail(status) {
    isShowNewDetail = status
}
export function getStatusNewDetail() {
    return isShowNewDetail
}
export function getCurrentTab() {
    return currentTab;
}
export function setCurrentTab(tab) {
    currentTab = tab;
}
export function getDicPage() {
    const tab = getCurrentTab()
    if (tab === 'relatedNews') {
        return dicPageRelated
    } else {
        return dicPageAll
    }
}
export function setDicPage(id) {
    const tab = getCurrentTab()
    if (tab === 'relatedNews') {
        if (!dicPageRelated.includes(id)) dicPageRelated.push(id)
    } else {
        if (!dicPageAll.includes(id)) dicPageAll.push(id)
    }
}
export function setDataNews(data, tab) {
    // const tab = getCurrentTab()
    if (tab === 'relatedNews') {
        dataRelated = [...dataRelated, ...data]
    } else {
        dataAll = [...dataAll, ...data]
    }
}
export function getDataNews() {
    const tab = getCurrentTab()
    if (tab === 'relatedNews') {
        return dataRelated;
    } else {
        return dataAll;
    }
}
export function resetData() {
    dataRelated = [];
    dataAll = [];
    pageId = 1
}
export function setStateLoadMore(value) {
    loadMore = value;
}
export function getStateLoadMore() {
    return loadMore;
}
export function getStateLoadPage(value) {
    loadPage = value;
}
export function setStateLoadPage() {
    return loadPage;
}
export function setPageId(Id) {
    pageId = Id
}
export function getPageId() {
    return pageId
}
export function nextPage() {
    pageId = pageId + 1;
    return pageId
}
export function resetDuration() {
    allDuration = {
        type: 'week',
        from: oneWeekAgo + '',
        to: today + ''
    };
    relatedDuration = {
        type: 'week',
        from: oneWeekAgo + '',
        to: today + ''
    };
}
export function setDuration(duration, time) {
    if (!duration) return;
    const today = new Date().getTime();
    const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
    if (currentTab === 'everything') {
        allDuration.type = duration
        if (duration === 'custom') {
            allDuration.from = (time && time.from) || oneWeekAgo
            allDuration.to = (time && time.to) || today
        } else {
            allDuration.from = null
            allDuration.to = null
        }
    } else {
        relatedDuration.type = duration
        if (duration === 'custom') {
            relatedDuration.from = (time && time.from) || oneWeekAgo
            relatedDuration.to = (time && time.to) || today
        } else {
            relatedDuration.from = null
            relatedDuration.to = null
        }
    }
}
export function getDuration() {
    if (currentTab === 'everything') {
        return allDuration;
    } else {
        return relatedDuration;
    }
}
export function resetNewType() {
    currentTab = 'relatedNews'
}
export function getNewType() {
    let newType = Enum.TYPE_NEWS.RELATED
    if (currentTab === 'everything') {
        newType = Enum.TYPE_NEWS.EVERYTHING
    }
    return newType
}

export function setSymbolSearch(symbolObj) {
    // if (!symbolObj || !symbolObj.symbol) return;
    const symbol = symbolObj.symbol;
    symbolSearchAll = symbol
}
export function getSymbolSearch() {
    return symbolSearchAll;
}
export function setTagNews(tagNews) {
    if (currentTab === 'everything') {
        tagNewsAll = tagNews
    } else {
        tagNewsRelated = tagNews
    }
}
export function getTagNews() {
    if (currentTab === 'everything') {
        return tagNewsAll
    } else {
        return tagNewsRelated
    }
}
