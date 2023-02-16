let dicUserWL = {}
let prevActiveTab = null
let activeTab = 0

export function syncActiveTab(tab) {
    prevActiveTab = activeTab
    activeTab = tab
}

export function getActiveTabProperty() {
    return {
        prevActiveTab,
        activeTab
    }
}

export function updateCheckUserWLStatus({ watchlist }) {
    if (!dicUserWL[watchlist]) {
        dicUserWL[watchlist] = true
    } else {
        dicUserWL[watchlist] = !dicUserWL[watchlist]
    }
}

export function checkWLChecked({ watchlist }) {
    return dicUserWL[watchlist] || false
}

export function getNumberUserWLChecked() {
    let numberUserWLChecked = 0
    Object.keys(dicUserWL).map(watchlist => {
        if (dicUserWL[watchlist]) {
            numberUserWLChecked++
        }
    })
    return numberUserWLChecked
}

export function getListUserWLChecked() {
    return Object.keys(dicUserWL).filter(watchlist => {
        return dicUserWL[watchlist]
    })
}

export function getDicUserWLChecked() {
    return dicUserWL
}

export function destroy() {
    dicUserWL = {}
    prevActiveTab = null
    activeTab = 0
}

export function resetDicUserWL() {
    dicUserWL = {}
}
