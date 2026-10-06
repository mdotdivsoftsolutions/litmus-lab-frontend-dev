
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingApi, BookingInvoiceSummary } from "@/lib/api/booking";
import { Download, Eye, FileText, AlertCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface InvoiceModalProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "";
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Shows the tax invoice uploaded by the Litmus accounts team for a booking.
 * Invoices are issued manually, so a booking may not have one yet.
 */
export function InvoiceModal({ bookingId, open, onOpenChange }: InvoiceModalProps) {
  const [busyAction, setBusyAction] = useState<"view" | "download" | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["labBookingInvoice", bookingId],
    queryFn: () => bookingApi.getBookingInvoice(bookingId as string),
    enabled: !!bookingId && open,
    staleTime: 30 * 1000,
  });

  const invoice: BookingInvoiceSummary | undefined = response?.data;

  // Release blob URLs so repeated previews don't leak memory.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) setPreviewUrl(null);
  }, [open]);

  const fetchBlobUrl = async () => {
    const blob = await bookingApi.downloadBookingInvoice(bookingId as string);
    return URL.createObjectURL(blob);
  };

  const handleView = async () => {
    if (!bookingId) return;
    try {
      setBusyAction("view");
      setPreviewUrl(await fetchBlobUrl());
    } catch {
      toast.error("Could not open the invoice. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownload = async () => {
    if (!bookingId || !invoice) return;
    try {
      setBusyAction("download");
      const url = await fetchBlobUrl();
      const link = document.createElement("a");
      link.href = url;
      link.download = invoice.fileName || `Litmus-Invoice-${invoice.invoiceNumber || bookingId.slice(-6)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Failed to download the invoice. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const isImage = invoice?.mimeType?.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={previewUrl ? "sm:max-w-4xl max-h-[92vh] flex flex-col" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" /> Tax Invoice
          </DialogTitle>
          <DialogDescription>Invoice issued by Litmus for this booking.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>We couldn&apos;t load the invoice details. Please try again later.</span>
          </div>
        ) : !invoice?.available ? (
          <div className="flex flex-col items-center text-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Invoice not issued yet</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Our accounts team will upload the tax invoice for this booking. You&apos;ll be notified by email as soon as it&apos;s available.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 min-h-0">
            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs">
              <div>
                <dt className="text-slate-500">Invoice No.</dt>
                <dd className="font-semibold text-slate-900 break-all">{invoice.invoiceNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Invoice Date</dt>
                <dd className="font-semibold text-slate-900">
                  {invoice.invoiceDate
                    ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">File</dt>
                <dd className="font-medium text-slate-800 truncate" title={invoice.fileName || undefined}>
                  {invoice.fileName} {invoice.size ? <span className="text-slate-400">({formatBytes(invoice.size)})</span> : null}
                </dd>
              </div>
            </dl>

            {previewUrl && (
              <div className="flex-1 min-h-[50vh] rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                {isImage ? (
                  <img src={previewUrl} alt="Invoice preview" className="w-full h-full object-contain" />
                ) : (
                  <iframe src={previewUrl} title="Invoice preview" className="w-full h-full min-h-[50vh]" />
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!previewUrl && (
                <Button variant="outline" className="flex-1 gap-2" onClick={handleView} disabled={busyAction !== null}>
                  {busyAction === "view" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  View
                </Button>
              )}
              <Button className="flex-1 gap-2" onClick={handleDownload} disabled={busyAction !== null}>
                {busyAction === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
