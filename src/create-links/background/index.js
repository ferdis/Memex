import db from '../../pouchdb'
import sessionState from '../../session-state/background'
import { generateLinkDocId } from '..'


browser.contextMenus.create({
    id: 'createLinkToSelection',
    title: 'Remember this quote',
    contexts: ['selection'],
})

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == 'createLinkToSelection') {
        const timestamp = new Date()
        const visitId = undefined
        const pageId = undefined // TODO
        db.put({
            _id: generateLinkDocId({timestamp}),
            creationTime: timestamp.getTime(),
            targetQuote: info.selectionText,
            targetUrl: info.pageUrl,
            visit: {
                _id: visitId,
            },
            page: {
                _id: pageId,
            },
        })
    }
})