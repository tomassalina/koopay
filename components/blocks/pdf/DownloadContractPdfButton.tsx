"use client"

import { useMemo, useState } from "react"
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toContractDataFromEscrow } from "./toContractDataFromEscrow"
import ContractPdfPreview from "./ContractPdfPreview"
import { usePDF } from "react-to-pdf"

type Props = {
  escrow: Escrow
}

export default function DownloadContractPdfButton({ escrow }: Props) {
  const [open, setOpen] = useState(false)
  const data = useMemo(() => toContractDataFromEscrow(escrow), [escrow])
  const filename = "payment-document.pdf"
  const { toPDF, targetRef } = usePDF({ filename })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Contract PDF</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Contract Preview</DialogTitle>
            <div>
              <Button onClick={() => toPDF()}>Download PDF</Button>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-auto">
          <ContractPdfPreview
            data={data}
            filename={filename}
            externalRef={targetRef}
            hideDownloadButton
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
