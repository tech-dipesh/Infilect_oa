import { Button } from "@/components/Button"

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span aria-live="polite">Page {page} of {pages}</span>
      <Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </nav>
  )
}
