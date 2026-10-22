// Who may edit or delete a job: its poster, or any signed-in user when the job has no
// recorded poster (jobs created before postedBy was saved)
export const canManageJob = (postedBy: unknown, userId?: string | null) =>
  Boolean(userId) && (!postedBy || String(postedBy) === String(userId))

const isSearchEngineUrl = (url: string): boolean =>
  /google\.[a-z.]+\/(?:search|url)|bing\.com\/search|duckduckgo\.com|search\.yahoo\.com|yandex\.[a-z.]+\/search/i.test(
    url
  )

const COMPANY_CAREERS_MAP: Record<string, string> = {
  google: "https://www.google.com/about/careers/applications/jobs/results",
  alphabet: "https://www.google.com/about/careers/applications/jobs/results",
  microsoft: "https://careers.microsoft.com/v2/global/en/home.html",
  amazon: "https://www.amazon.jobs/en",
  aws: "https://www.amazon.jobs/en/teams/aws",
  meta: "https://www.metacareers.com/jobs",
  facebook: "https://www.metacareers.com/jobs",
  instagram: "https://www.metacareers.com/jobs",
  whatsapp: "https://www.metacareers.com/jobs",
  apple: "https://jobs.apple.com/en-us/search",
  netflix: "https://jobs.netflix.com/search",
  stripe: "https://stripe.com/jobs",
  vercel: "https://vercel.com/careers",
  spotify: "https://www.lifeatspotify.com/jobs",
  airbnb: "https://careers.airbnb.com/",
  uber: "https://www.uber.com/careers/list/",
  canva: "https://www.lifeatcanva.com/en/jobs/",
  atlassian: "https://www.atlassian.com/company/careers/all-jobs",
  github: "https://github.com/about/careers",
  gitlab: "https://about.gitlab.com/handbook/careers/",
  shopify: "https://www.shopify.com/careers/search",
  twitter: "https://careers.x.com/",
  x: "https://careers.x.com/",
  openai: "https://openai.com/careers/search",
  anthropic: "https://www.anthropic.com/careers",
  adobe: "https://careers.adobe.com/us/en",
  salesforce: "https://careers.salesforce.com/en/jobs/",
  oracle: "https://www.oracle.com/corporate/careers/",
  ibm: "https://www.ibm.com/careers",
  intel: "https://jobs.intel.com/en",
  cisco: "https://jobs.cisco.com/",
  linkedin: "https://careers.linkedin.com/",
  dropbox: "https://www.dropbox.com/jobs",
  slack: "https://slack.com/careers",
  discord: "https://discord.com/careers",
  reddit: "https://www.redditinc.com/careers",
  pinterest: "https://www.pinterestcareers.com/",
  snap: "https://careers.snap.com/",
  snapchat: "https://careers.snap.com/",
  bytedance: "https://jobs.bytedance.com/en",
  tiktok: "https://careers.tiktok.com/",
  nvidia: "https://www.nvidia.com/en-us/about-nvidia/careers/",
  tesla: "https://www.tesla.com/careers",
  palantir: "https://www.palantir.com/careers/",
  coinbase: "https://www.coinbase.com/careers",
  robinhood: "https://robinhood.com/careers/",
  figma: "https://www.figma.com/careers/",
  notion: "https://www.notion.so/careers",
  linear: "https://linear.app/careers",
  supabase: "https://supabase.com/careers",
  prisma: "https://www.prisma.io/careers",
  cloudflare: "https://www.cloudflare.com/careers/jobs/",
  datadog: "https://careers.datadoghq.com/",
  snowflake: "https://careers.snowflake.com/us/en",
  twilio: "https://www.twilio.com/company/jobs",
  zoom: "https://careers.zoom.us/",
  paypal: "https://careers.pypl.com/",
  square: "https://block.xyz/careers",
  block: "https://block.xyz/careers",
  doordash: "https://careers.doordash.com/",
  instacart: "https://instacart.careers/",
  lyft: "https://www.lyft.com/careers",
  yelp: "https://www.yelp.careers/",
  mongodb: "https://www.mongodb.com/careers",
  elastic: "https://www.elastic.co/careers",
  hubspot: "https://www.hubspot.com/careers",
  box: "https://www.box.com/careers",
  docusign: "https://careers.docusign.com/",
  workday: "https://www.workday.com/en-us/company/careers.html",
  servicenow: "https://careers.servicenow.com/",
  zendesk: "https://jobs.zendesk.com/",
  intuit: "https://www.intuit.com/careers/",
  vmware: "https://careers.vmware.com/",
  amd: "https://www.amd.com/en/corporate/careers.html",
  qualcomm: "https://www.qualcomm.com/company/careers",
  arm: "https://careers.arm.com/",
  broadcom: "https://www.broadcom.com/company/careers",
  booking: "https://careers.booking.com/",
  expedia: "https://careers.expediagroup.com/",
  ebay: "https://jobs.ebayinc.com/",
  etsy: "https://careers.etsy.com/",
  target: "https://corporate.target.com/careers",
  walmart: "https://careers.walmart.com/",
  seek: "https://www.seek.com.au/jobs",
  cultureamp: "https://www.cultureamp.com/careers",
  safetyculture: "https://safetyculture.com/careers/",
  reagroup: "https://www.rea-group.com/careers/",
  xero: "https://www.xero.com/about/careers/",
  wisetech: "https://www.wisetechglobal.com/careers/",
  macquarie: "https://www.macquarie.com/careers",
  telstra: "https://careers.telstra.com/",
  commbank: "https://www.commbank.com.au/about-us/careers.html",
  anz: "https://www.anz.com.au/about-us/careers/",
  nab: "https://www.nab.com.au/about-us/careers",
  westpac: "https://www.westpac.com.au/about-westpac/careers/",
  samsung: "https://www.samsung.com/global/careers/",
  sony: "https://www.sony.com/en/SonyInfo/Careers/",
  siemens: "https://www.siemens.com/global/en/company/jobs.html",
}

export const resolveCompanyJobUrl = (
  applicationUrl?: string | null,
  company?: string | null,
  fallbackRoute?: string
): string => {
  if (applicationUrl && applicationUrl.trim().length > 0) {
    const trimmed = applicationUrl.trim()
    if (!isSearchEngineUrl(trimmed)) {
      return trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`
    }
  }

  if (company && company.trim().length > 0) {
    const normalized = company.toLowerCase().trim().replace(/[^a-z0-9]/g, "")
    for (const [key, careersUrl] of Object.entries(COMPANY_CAREERS_MAP)) {
      if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
        return careersUrl
      }
    }

    const cleanSlug = company.toLowerCase().trim().replace(/\s+/g, "").replace(/[^a-z0-9-]/g, "")
    if (cleanSlug.length > 0) {
      return `https://www.${cleanSlug}.com/careers`
    }
  }

  return fallbackRoute || "/"
}
