import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingApi } from "@/lib/api/booking";
import { Download, Copy, FileText, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceModalProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceModal({ bookingId, open, onOpenChange }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["labBookingInvoice", bookingId],
    queryFn: () => (bookingId ? bookingApi.getBookingInvoice(bookingId) : null),
    enabled: !!bookingId && open,
  });

  const invoice = response?.data;

  const handleDownloadPdf = async () => {
    if (!invoice || !printRef.current) return;
    try {
      setIsDownloading(true);
      toast.info("Preparing PDF download...");

      if (typeof window !== "undefined" && !(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Could not load PDF library"));
          document.head.appendChild(script);
        });
      }

      const safeInvoiceNo = (invoice.invoiceNumber || "Invoice").replace(/[/\\?%*:|"<>]/g, "-");
      const filename = `Invoice-${safeInvoiceNo}.pdf`;

      const opt = {
        margin: [6, 8, 6, 8],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await (window as any).html2pdf().set(opt).from(printRef.current).save();
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err: any) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
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
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-20 backdrop-blur-sm flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-[#007799]" />
              Official Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Litmus Food Analytics LLP • Kerala (Code: 32)
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
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="h-8 text-xs gap-1.5 bg-[#007799] hover:bg-[#00607c] text-white shadow-xs font-semibold"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 sm:p-10 bg-white">
          {isLoading && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
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
            <div
              ref={printRef}
              className="p-8 sm:p-10 max-w-[760px] mx-auto bg-white text-black font-serif text-[12px] leading-normal"
              style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
            >
              {/* Header Top */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[18px] font-bold text-black leading-tight mb-1">
                    {invoice.company.legalName}
                  </div>
                  <div className="text-[11.5px] text-black leading-[1.35]">
                    <div>{invoice.company.addressLine1}</div>
                    <div>{invoice.company.addressLine2}</div>
                    <div>Phone no.: {invoice.company.phone}</div>
                    <div>Email: {invoice.company.email}</div>
                    <div>GSTIN: {invoice.company.gstin}</div>
                    <div>State: {invoice.company.state}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <img
                    src="/logo.png"
                    alt="Litmus Logo"
                    width={160}
                    height={48}
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                      const fallback = (e.target as HTMLElement).nextElementSibling;
                      if (fallback) (fallback as HTMLElement).style.display = "block";
                    }}
                  />

                  <div style={{ display: "none" }} className="text-right font-sans">
                    <span className="text-2xl font-extrabold text-[#15803d] tracking-tight">litmus</span>
                    <span className="block text-[9px] font-bold text-[#dc2626] uppercase -mt-1">Food Analytics LLP.</span>
                  </div>
                </div>
              </div>

              {/* Blue Top Divider Line */}
              <div className="border-t-2 border-[#0077b6] mt-4 mb-2"></div>

              {/* Centered Title Banner */}
              <div className="text-center mb-6">
                <span className="text-[20px] text-[#0077b6] tracking-wide font-normal">
                  Invoice
                </span>
              </div>

              {/* Bill To & Invoice Details Grid */}
              <div className="flex justify-between items-start text-[13px] leading-[1.45] mb-6">
                <div className="max-w-[55%]">
                  <div className="mb-2">Bill To</div>
                  <div className="uppercase mb-1.5 font-normal">
                    {invoice.customer.companyName || invoice.customer.name}
                  </div>
                  <div className="mb-2">{invoice.customer.address}</div>
                  <div className="mb-1.5">Contact No.: {invoice.customer.phone}</div>
                  <div>State: {invoice.customer.state}</div>
                </div>

                <div className="text-right">
                  <div className="mb-2 font-normal">Invoice Details</div>
                  <div>Invoice No.: {invoice.invoiceNumber}</div>
                  <div>Date: {invoice.invoiceDate}</div>
                  <div>Time: {invoice.invoiceTime}</div>
                  <div>Place of Supply: {invoice.placeOfSupply}</div>
                  <div>PO date: {invoice.poDate}</div>
                  <div>PO number: {invoice.poNumber}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="my-4">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-[#007799] text-white text-[12px] font-normal">
                      <th className="py-2 px-1.5 w-8 text-center font-normal">#</th>
                      <th className="py-2 px-1.5 text-left font-normal">Item name</th>
                      <th className="py-2 px-1.5 w-20 text-center font-normal">HSN/ SAC</th>
                      <th className="py-2 px-1.5 w-16 text-center font-normal">Quantity</th>
                      <th className="py-2 px-1.5 w-24 text-right font-normal">Price/ unit</th>
                      <th className="py-2 px-1.5 w-28 text-right font-normal">GST</th>
                      <th className="py-2 px-1.5 w-24 text-right font-normal">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item: any) => (
                      <tr key={item.slNo}>
                        <td className="py-2.5 px-1.5 text-center align-top text-black">{item.slNo}</td>
                        <td className="py-2.5 px-1.5 align-top text-black">
                          <div className="font-bold">{item.itemName}</div>
                          {item.itemSubtitle && (
                            <div className="text-[12px] mt-0.5">{item.itemSubtitle}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-1.5 text-center align-top text-black">{item.sacCode}</td>
                        <td className="py-2.5 px-1.5 text-center align-top text-black">{item.quantity}</td>
                        <td className="py-2.5 px-1.5 text-right align-top text-black">
                          ₹ {item.pricePerUnit?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-1.5 text-right align-top text-black">
                          ₹ {item.gstAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({item.gstRate?.toFixed(1)}%)
                        </td>
                        <td className="py-2.5 px-1.5 text-right align-top text-black font-normal">
                          ₹ {item.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-b border-black font-bold text-[13px]">
                      <td className="py-2 px-1.5"></td>
                      <td className="py-2 px-1.5 text-black font-bold">Total</td>
                      <td className="py-2 px-1.5"></td>
                      <td className="py-2 px-1.5"></td>
                      <td className="py-2 px-1.5"></td>
                      <td className="py-2 px-1.5 text-right text-black font-bold">
                        ₹ {invoice.totals.totalGstAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-1.5 text-right text-black font-bold">
                        ₹ {invoice.totals.grandTotal?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Middle Section: Words, Terms & Right Financial Summary */}
              <div className="flex justify-between items-start gap-6 my-4 pt-1">
                <div className="flex-1 text-[12px]">
                  <div className="font-bold text-[12.5px] text-black mb-1">
                    Invoice Amount In Words
                  </div>
                  <div className="text-black mb-4 leading-normal">{invoice.totals.amountInWords}</div>

                  <div className="font-bold text-[12.5px] text-black mb-1">
                    Terms And Conditions
                  </div>
                  <div className="text-black text-[11.5px] leading-[1.4]">
                    {invoice.termsAndConditions?.map((tc: string, i: number) => (
                      <div key={i} className="mb-1">{tc}</div>
                    ))}
                  </div>
                </div>

                <div className="w-72 text-[12px]">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-0.5 text-black">Sub Total</td>
                        <td className="py-0.5 text-right text-black">
                          ₹ {invoice.totals.subTotal?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black">SGST@{invoice.totals.sgstRate?.toFixed(1)}%</td>
                        <td className="py-0.5 text-right text-black">
                          ₹ {invoice.totals.sgstAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black">CGST@{invoice.totals.cgstRate?.toFixed(1)}%</td>
                        <td className="py-0.5 text-right text-black">
                          ₹ {invoice.totals.cgstAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="bg-[#007799] text-white font-bold">
                        <td className="py-1 px-1.5">Total</td>
                        <td className="py-1 px-1.5 text-right">
                          ₹ {invoice.totals.grandTotal?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black">Received</td>
                        <td className="py-0.5 text-right text-black">
                          ₹ {invoice.totals.receivedAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black">Balance</td>
                        <td className="py-0.5 text-right text-black">
                          ₹ {invoice.totals.balanceAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black">Payment Mode</td>
                        <td className="py-0.5 text-right text-black">
                          {invoice.paymentMode}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Section: Pay To & Signatory */}
              <div className="flex justify-between items-start pt-4 mt-6 text-[11.5px] leading-[1.45]">
                <div className="max-w-[55%] text-black">
                  <div className="font-bold text-[12.5px] text-black mb-1">Pay To:</div>
                  <div>Bank Name: {invoice.company.bankName}</div>
                  <div>Bank Account No.: {invoice.company.bankAccountNo}</div>
                  <div>Bank IFSC code: {invoice.company.bankIfsc}</div>
                  <div>Account Holder&apos;s Name: {invoice.company.accountHolderName}</div>
                </div>

                <div className="text-right w-60">
                  <div className="font-bold text-[12px] text-black mb-1">
                    For: {invoice.company.legalName}
                  </div>
                  <div className="my-1 flex justify-end">
                    <img
                      src="/signature.png"
                      alt="Signature"
                      width={120}
                      height={40}
                      className="h-10 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-[11.5px] text-black">Authorized Signatory</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

