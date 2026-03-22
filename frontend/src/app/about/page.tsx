import { getSiteSettings } from '@/lib/api'
import AboutContent from '@/components/AboutContent'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const settings = await getSiteSettings()
  return <AboutContent settings={settings} />
}
