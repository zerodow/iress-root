let dicSub = {}
let dicSnapshot = {}

/* #region dicSub */
export function setDicSub(newDicSub = {}) {
    dicSub = { ...newDicSub }
}

export function getDicSub() {
    return dicSub;
}
/* #endregion */

/* #region dicSnapshot */
export function setDicSnapshot(newDicSnapshot = {}) {
    dicSnapshot = { ...newDicSnapshot }
}

export function getDicSnapshot() {
    return dicSnapshot;
}
/* #endregion */
