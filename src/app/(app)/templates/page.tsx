import { Header } from "@/components/layout/Header"
import { TemplatesGallery } from "@/components/templates/TemplatesGallery"

export default function TemplatesPage() {
  return (
    <>
      <Header title="Funnel Templates" />
      <div className="flex-1 overflow-y-auto p-6">
        <TemplatesGallery />
      </div>
    </>
  )
}
