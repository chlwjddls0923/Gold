import { getSiteSettings } from '@/lib/api'
import ManufacturingContent from '@/components/ManufacturingContent'

export const dynamic = 'force-dynamic'

export default async function ManufacturingPage() {
  const settings = await getSiteSettings()
  return <ManufacturingContent settings={settings} />
}
