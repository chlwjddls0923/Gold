import { getSiteSettings } from '@/lib/api'
import ContactContent from '@/components/ContactContent'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const settings = await getSiteSettings()
  return <ContactContent settings={settings} />
}
