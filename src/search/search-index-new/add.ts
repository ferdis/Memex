import db from '.'
import normalizeUrl from '../../util/encode-url-for-id'
import pipeline, { PipelineReq, transformUrl } from './pipeline'
import { Page, FavIcon } from './models'
import { VisitInteraction, PageAddRequest } from './types'

/**
 * Adds/updates a page + associated visit (pages never exist without either an assoc.
 *  visit or bookmark in current model).
 */
export async function addPage({
    visits = [],
    bookmark,
    pageDoc,
}: PageAddRequest) {
    const { favIconURI, ...pageData } = await pipeline({ pageDoc })

    try {
        await db.transaction('rw', db.tables, async () => {
            const page = new Page(pageData as any)

            if (favIconURI != null) {
                await new FavIcon({ hostname: page.hostname, favIconURI })
                    .save()
                    .catch()
            }

            await page.loadRels()

            // Create Visits for each specified time, or a single Visit for "now" if no assoc event
            visits = !visits.length && bookmark == null ? [Date.now()] : visits
            visits.forEach(time => page.addVisit(time))

            if (bookmark != null) {
                page.setBookmark(bookmark)
            }

            await page.save()
        })
    } catch (error) {
        console.error(error)
    }
}

export async function addPageTerms(pipelineReq: PipelineReq) {
    const pageData = await pipeline(pipelineReq)

    try {
        await db.transaction('rw', db.tables, async () => {
            const page = new Page(pageData as any)
            await page.loadRels()
            await page.save()
        })
    } catch (error) {
        console.error(error)
    }
}

/**
 * Updates an existing specified visit with interactions data.
 */
export async function updateTimestampMeta(
    url: string,
    time: number,
    data: Partial<VisitInteraction>,
) {
    const normalized = normalizeUrl(url)

    await db.transaction('rw', db.visits, () =>
        db.visits
            .where('[time+url]')
            .equals([time, normalized])
            .modify(data),
    )
}

export async function addVisit(url: string, time = Date.now()) {
    const normalized = normalizeUrl(url)

    return db.transaction('rw', db.tables, async () => {
        const matchingPage = await db.pages.get(normalized)
        if (matchingPage == null) {
            throw new Error(
                `Cannot add visit for non-existent page: ${normalized}`,
            )
        }

        await matchingPage.loadRels()
        matchingPage.addVisit(time)
        return await matchingPage.save()
    })
}

export async function addFavIcon(url: string, favIconURI: string) {
    const { hostname } = transformUrl(url)

    return new FavIcon({ hostname, favIconURI }).save()
}
