import I18n from '~/modules/language/'
import ENUM from '~/enum'

const { NEWS_ERROR } = ENUM

export function checkUnavailableNew(dataNews) {
    const { showUnavailableNew } = dataNews
    if (showUnavailableNew) {
        return true
    }
    return false
}
export function checkHasTitle(dataNews) {
    const { title } = dataNews
    if (title) {
        return true
    }
    return false
}
export function checkHasDocTypeAndCode({ documentType, newsCode }) {
    if (!documentType || !newsCode) {
        return false
    }
    return true
}
export function checkTitleHasStar(dataNews) {
    const { title } = dataNews
    if (!title) {
        return false
    }
    if (title[0] === '*') {
        return true
    }
    return false
}

export function getNewsError(dataNews) {
    const { document_type: documentType, news_code: newsCode } = dataNews
    if (!checkHasDocTypeAndCode({ documentType, newsCode })) {
        return I18n.t(NEWS_ERROR.NEWS_STORY_UNAVAILABLE)
    }
    return ''
}
