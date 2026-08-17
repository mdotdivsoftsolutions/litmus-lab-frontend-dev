import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingApi } from "@/lib/api/booking";
import { Printer, Copy, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface InvoiceModalProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceModal({ bookingId, open, onOpenChange }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["labBookingInvoice", bookingId],
    queryFn: () => (bookingId ? bookingApi.getBookingInvoice(bookingId) : null),
    enabled: !!bookingId && open,
  });

  const invoice = response?.data;
  const isPaid = invoice?.paymentStatus === "SUCCESS" || invoice?.paymentStatus === "PAID";

  const handlePrint = () => {
    if (!invoice || !printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const content = printRef.current.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tax Invoice - ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
              th { background: #f8fafc; text-align: left; font-weight: 700; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
              .badge-paid { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
              .badge-pending { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${content}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const copyInvoiceNumber = () => {
    if (invoice?.invoiceNumber) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      toast.success("Invoice number copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-slate-200 shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-20 backdrop-blur-sm flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-emerald-700" />
              Tax Invoice & Billing Slip
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              GST-Compliant Official Invoice • Technical Testing (SAC: 998346)
            </DialogDescription>
          </div>
          {invoice && (
            <div className="flex items-center gap-2 pr-6">
              <Button
                variant="outline"
                size="sm"
                onClick={copyInvoiceNumber}
                className="h-8 text-xs gap-1.5 bg-white border-slate-200"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy No.
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="h-8 text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 sm:p-8 bg-white">
          {isLoading && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {error && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <p className="text-sm font-semibold text-slate-800">Unable to load invoice</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {(error as any)?.response?.data?.message || "There was an issue fetching the invoice details. Please try again."}
              </p>
            </div>
          )}

          {invoice && (
            <div ref={printRef} className="space-y-6 font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-emerald-800">
                      {invoice.company.brandName}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                      Official
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-1">{invoice.company.legalName}</p>
                  <p className="text-[11px] text-slate-500">
                    {invoice.company.addressLine1}, {invoice.company.city}, {invoice.company.state} - {invoice.company.pincode}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    GSTIN: <strong className="text-slate-800">{invoice.company.gstin}</strong> | PAN: <strong className="text-slate-800">{invoice.company.pan}</strong> | FSSAI: <strong className="text-slate-800">{invoice.company.fssaiNumber}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">ORIGINAL FOR RECIPIENT</span>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">TAX INVOICE</h3>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      isPaid 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {isPaid ? "✓ PAID IN FULL" : "PAYMENT PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Invoice Number</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Invoice Date</span>
                  <span className="text-xs font-bold text-slate-800">{invoice.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Booking ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{invoice.bookingId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Payment Ref</span>
                  <span className="text-[11px] font-mono text-slate-600 truncate block" title={invoice.transactionId}>
                    {invoice.transactionId}
                  </span>
                </div>
              </div>

              {/* Parties */}
              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
                    Billed To (Customer Details)
                  </h4>
                  <p className="text-xs font-bold text-slate-900">{invoice.customer.name}</p>
                  {invoice.customer.companyName && (
                    <p className="text-xs text-slate-700 font-medium">{invoice.customer.companyName}</p>
                  )}
                  <p className="text-[11px] text-slate-600 leading-relaxed">{invoice.customer.address}</p>
                  <p className="text-[11px] text-slate-600">
                    Email: <span className="text-slate-800">{invoice.customer.email}</span> | Phone: <span className="text-slate-800">{invoice.customer.phone}</span>
                  </p>
                  {invoice.customer.fssaiNumber && invoice.customer.fssaiNumber !== "N/A" && (
                    <p className="text-[11px] text-slate-600">
                      FSSAI Lic No: <strong className="text-slate-800">{invoice.customer.fssaiNumber}</strong>
                    </p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100">
                    Fulfilling Partner Facility
                  </h4>
                  <p className="text-xs font-bold text-slate-900">{invoice.fulfillmentLab.labName}</p>
                  <p className="text-[11px] text-slate-600">
                    Accreditation: <strong className="text-slate-800">{invoice.fulfillmentLab.nablNumber}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Location: {invoice.fulfillmentLab.city}, {invoice.fulfillmentLab.state}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Protocol: Certified NABL / ISO-17025 Standard Matrix Testing
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Service Description</th>
                      <th className="p-3 w-20 text-center">SAC</th>
                      <th className="p-3 w-24 text-right">Taxable (₹)</th>
                      <th className="p-3 w-24 text-right">CGST 9% (₹)</th>
                      <th className="p-3 w-24 text-right">SGST 9% (₹)</th>
                      <th className="p-3 w-28 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item: any) => (
                      <tr key={item.slNo} className="hover:bg-slate-50/50">
                        <td className="p-3 text-center text-slate-500 font-medium">{item.slNo}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{item.description}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.sampleDetailsText}</div>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600 font-medium">{item.sacCode}</td>
                        <td className="p-3 text-right font-medium text-slate-700">
                          ₹{item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-slate-600">
                          ₹{item.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-slate-600">
                          ₹{item.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                <div className="w-full sm:max-w-md bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-1">
                    Invoice Amount in Words
                  </span>
                  <p className="text-xs font-semibold text-emerald-950 leading-snug">
                    {invoice.taxSummary.amountInWords}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-2 font-medium">
                    Payment Method: {invoice.paymentMethod}
                  </p>
                </div>

                <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{invoice.taxSummary.taxableSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Central GST (9%):</span>
                    <span className="font-semibold text-slate-800">
                      ₹{invoice.taxSummary.cgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>State GST (9%):</span>
                    <span className="font-semibold text-slate-800">
                      ₹{invoice.taxSummary.sgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5">
                    <span>Total GST Amount:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{invoice.taxSummary.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-emerald-800 border-t-2 border-slate-900 pt-2">
                    <span>Grand Total (INR):</span>
                    <span>₹{invoice.taxSummary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Certification */}
              <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-6 border-t border-dashed border-slate-300">
                <div className="text-[10px] text-slate-500 space-y-1 max-w-lg">
                  <p className="font-bold text-slate-700">Declarations & Terms:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {invoice.notes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-center sm:text-right shrink-0">
                  <div className="inline-flex flex-col items-center p-3 border-2 border-emerald-600 rounded-xl bg-emerald-50/60 shadow-2xs">
                    <ShieldCheck className="h-6 w-6 text-emerald-700 mb-1" />
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                      Digitally Verified
                    </span>
                    <span className="text-[9px] text-emerald-700 font-medium">Litmus Financial Authority</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
