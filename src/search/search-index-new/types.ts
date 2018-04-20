export interface SearchParams {
    domains: string[]
    tags: string[]
    queryTerms: string[]
    endDate?: number
    startDate?: number
    skip: number
    limit: number
}

/**
 * @typedef {Object} VisitInteraction
 * @property {number} duration Time user was active during visit (ms).
 * @property {number} scrollPx Y-axis pixel scrolled to at point in time.
 * @property {number} scrollPerc
 * @property {number} scrollMaxPx Furthest y-axis pixel scrolled to during visit.
 * @property {number} scrollMaxPerc
 */
export interface VisitInteraction {
    duration: number
    scrollPx: number
    scrollPerc: number
    scrollMaxPx: number
    scrollMaxPerc: number
}

/**
 * @typedef {Object} PageAddRequest
 * @property {any} pageData TODO: type
 * @property {number[]} [visits=[]] Opt. visit times to assoc. with Page.
 * @property {number} [bookmark] Opt. bookmark time to assoc. with Page.
 */
export interface PageAddRequest {
    pageDoc: PageDoc
    visits: number[]
    bookmark: number
}

export interface PageDoc {
    content: Partial<PageContent>
    url: string
    [extra: string]: any
}

export interface PageContent {
    fullText: string
    title: string
}

export type PageID = string
export type PageScore = number
export type SearchResult = [PageID, PageScore]
