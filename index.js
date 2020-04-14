const COOKIE = "URL"
const URL = "https://cfw-takehome.developers.workers.dev/api/variants"

addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request))
})

/**
Request handler
*/
async function handleRequest(request) {
    const cookie = cookieSite(request, COOKIE)
    if (cookie) return variantReturn(cookie)
    return variantReturn()
}

/**
Gets one of two sites from CloudFlare at (relatively) random
For more on the limitations of pseudo-random generators,
see here https://en.wikipedia.org/wiki/Pseudorandom_number_generator
*/
async function fetchVariant() {
    const sites = await fetch(URL)
    const parsedSites = await sites.json()
    return parsedSites.variants[Math.round(Math.random())]
}
/**
Injecting customized text into the pages.
*/

class title {
    element(text) {
        text.prepend("Cyril Gorlla Presents: ")
    }
}

class desc {
    element(text) {
        text.replace("Welcome to this page, part of CloudFlare's 2020 Internship coding challenge. " +
            " There was a 50% chance that you landed on this particular page. You can see the project's code on GitHub.")
    }
}

class call {
    element(text) {
        text.setInnerContent("Visit me on GitHub")
        text.setAttribute("href", "https://github.com/cgorlla")
    }
}
/**
 * Does some string manipulation on headers to get visited site
 * @param {Request} request A request
 * @param {string} cookieN Cookie's name
 */
function cookieSite(request, cookieN) {
    let site = null
    if (request.headers.get("Cookie")) {
        request.headers.get("Cookie").split(";").forEach((cookie) => {
            if (cookie.split("=")[0].trim() === cookieN) {
                site = cookie.split("=")[1]
            }
        })
    }
    return site
}

/**
 * Returns the variant site at random, setting cookie if it doesn't exist
 * @param {Null | string} cookieN Cookie's name
 */
async function variantReturn(cookieN = null) {
    const titleChange = new title()
    const descChange = new desc()
    const callChange = new call()
    const site = cookieN ? cookieN : await fetchVariant()
    const changed = await fetch(site)
    const varian = new HTMLRewriter()
        .on("title", titleChange)
        .on("h1#title", titleChange)
        .on("p#description", descChange)
        .on("a#url", callChange)
        .transform(changed)

    if (!cookieN) {
        varian.headers.set("Set-Cookie", `${COOKIE}=${site}`)
    }

    return varian
}
