"use client"

import { MutableRefObject, RefObject, useMemo } from "react"
import { usePDF } from "react-to-pdf"
import type { ContractData } from "./contract-types"
import { Button } from "@/components/ui/button"

type Props = {
  data: ContractData
  filename?: string
  externalRef?: RefObject<HTMLDivElement> | MutableRefObject<HTMLDivElement | null>
  hideDownloadButton?: boolean
}

function formatAmount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export function ContractPdfPreview({
  data,
  filename = "payment-document.pdf",
  externalRef,
  hideDownloadButton,
}: Props) {
  const { toPDF, targetRef } = usePDF({ filename })
  const refToUse = (externalRef as RefObject<HTMLDivElement>) ?? targetRef

  const total = useMemo(() => {
    if (Array.isArray(data.milestones) && data.milestones.length > 0) {
      return data.milestones.reduce((sum, m) => sum + m.amount, 0)
    }
    return data.totalAmount
  }, [data])

  const handleDownload = async () => {
    try {
      await toPDF()
    } catch (e) {
      console.error("Failed to generate PDF", e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!hideDownloadButton && (
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload}>Download PDF</Button>
          <span className="text-sm text-muted-foreground">Filename: {filename}</span>
        </div>
      )}

      <div
        ref={refToUse}
        className="bg-white text-black p-8 rounded-md shadow border w-[794px] max-w-full mx-auto"
        style={{ aspectRatio: "1/1.4142" }}
      >
        <header className="border-b pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{data.contractTitle}</h1>
              {data.contractId ? (
                <p className="text-xs text-neutral-500">Contract ID: {data.contractId}</p>
              ) : null}
            </div>
            <div className="text-right text-sm text-neutral-600">
              {data.startDate ? <p>Start: {data.startDate}</p> : null}
              {data.endDate ? <p>End: {data.endDate}</p> : null}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-1">
            <h2 className="font-medium">Contractor</h2>
            <p className="text-sm">{data.contractor.name}</p>
            {data.contractor.company && <p className="text-sm">{data.contractor.company}</p>}
            {data.contractor.title && <p className="text-sm">{data.contractor.title}</p>}
            {data.contractor.email && <p className="text-sm">{data.contractor.email}</p>}
            {data.contractor.address && <p className="text-sm">{data.contractor.address}</p>}
          </div>
          <div className="space-y-1">
            <h2 className="font-medium">Freelancer</h2>
            <p className="text-sm">{data.freelancer.name}</p>
            {data.freelancer.company && <p className="text-sm">{data.freelancer.company}</p>}
            {data.freelancer.title && <p className="text-sm">{data.freelancer.title}</p>}
            {data.freelancer.email && <p className="text-sm">{data.freelancer.email}</p>}
            {data.freelancer.address && <p className="text-sm">{data.freelancer.address}</p>}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-medium mb-2">Scope of Work</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.scopeOfWork}</p>
        </section>

        {data.milestones && data.milestones.length > 0 ? (
          <section className="mb-6">
            <h2 className="font-medium mb-2">Milestones</h2>
            <div className="border rounded">
              <div className="grid grid-cols-12 text-sm font-medium border-b bg-neutral-50">
                <div className="col-span-4 p-2">Title</div>
                <div className="col-span-5 p-2">Description</div>
                <div className="col-span-2 p-2 text-right">Amount</div>
                <div className="col-span-1 p-2 text-right">Due</div>
              </div>
              {data.milestones.map((m, idx) => (
                <div key={idx} className="grid grid-cols-12 text-sm border-b last:border-0">
                  <div className="col-span-4 p-2">{m.title}</div>
                  <div className="col-span-5 p-2">{m.description || "—"}</div>
                  <div className="col-span-2 p-2 text-right">
                    {formatAmount(m.amount, data.paymentCurrency)}
                  </div>
                  <div className="col-span-1 p-2 text-right">{m.dueDate || "—"}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 text-sm">
                <div className="col-span-9 p-2 text-right font-medium">Total</div>
                <div className="col-span-3 p-2 text-right font-semibold">
                  {formatAmount(total, data.paymentCurrency)}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-6">
            <h2 className="font-medium mb-2">Compensation</h2>
            <p className="text-sm">
              Total Compensation: <span className="font-semibold">{formatAmount(total, data.paymentCurrency)}</span>
            </p>
          </section>
        )}

        {data.terms ? (
          <section className="mb-8">
            <h2 className="font-medium mb-2">Terms</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.terms}</p>
          </section>
        ) : null}

        <footer className="pt-8 border-t">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium mb-10">Contractor Signature</p>
              <div className="h-[1px] bg-neutral-300" />
              <p className="text-xs mt-2 text-neutral-700">{data.contractor.name}</p>
              <p className="text-[10px] text-neutral-500">{data.signaturePlace || ""}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-10">Freelancer Signature</p>
              <div className="h-[1px] bg-neutral-300" />
              <p className="text-xs mt-2 text-neutral-700">{data.freelancer.name}</p>
              <p className="text-[10px] text-neutral-500">{data.signaturePlace || ""}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ContractPdfPreview
