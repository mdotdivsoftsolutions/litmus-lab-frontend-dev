import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Download, 
  Beaker, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { labApi } from "@/lib/api/lab";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabBookingDetails() {
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ["labBookings"],
    queryFn: labApi.getMyLabBookings,
  });

  const rawBookings = response?.data || [];
  const booking = rawBookings.find((b: any) => b._id === id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto pb-10 space-y-6 pt-6 px-4 md:px-0 animate-pulse">
        {/* Header Actions Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Info Skeleton */}
          <div className="flex justify-between items-start border-b border-border py-6">
            <div>
              <Skeleton className="h-8 w-64 mb-3" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-24 mb-2 ml-auto" />
              <Skeleton className="h-4 w-32 mb-1 ml-auto" />
              <Skeleton className="h-4 w-32 ml-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent className="pt-4 p-0 md:p-6 space-y-6">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-slate-50 border-b border-border p-4">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <div className="p-4 space-y-4">
                  <div className="bg-white rounded-md border border-slate-100 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-6 w-48" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-4 w-40 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button asChild><Link to="/lab/bookings">Back to Bookings</Link></Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const getPrimaryProductName = (b: any) => {
    if (!b.items || b.items.length === 0) return "Custom Order";
    const item = b.items[0];
    return item.packageId?.name || item.testId?.testName || item.testId?.name || "Service Item";
  };

  const totalSamples = booking.items?.reduce((count: number, i: any) => count + (i.samples?.length || 0), 0) || 0;

  return (
    <div className=" animate-fade-in max-w-7xl mx-auto pb-10">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            .print-border {
              border: 1px solid #e2e8f0 !important;
              box-shadow: none !important;
            }
            .print-bg {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Header Actions */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/lab/bookings"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booking Details</h1>
            <p className="text-sm text-muted-foreground">Comprehensive information for testing</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link to={`/lab/bookings/${booking._id}/upload`}><UploadIcon className="h-4 w-4" />Upload Results</Link>
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div id="print-area" className="space-y-6">
        {/* Print Header (Only shows cleanly in print or on screen) */}
        <div className="flex justify-between items-start border-b border-border py-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Litmus Order #{booking._id.substring(booking._id.length - 8).toUpperCase()}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(booking.createdAt), "MMMM d, yyyy 'at' HH:mm")}</span>
              <span>•</span>
              <span className="font-medium text-slate-700">{getPrimaryProductName(booking)}</span>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={booking.status} />
            <p className="text-sm font-medium text-slate-700">Total Items: {booking.items?.length || 0}</p>
            <p className="text-sm font-medium text-slate-700">Total Samples: {totalSamples}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="print-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border print-bg">
              <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Client Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="col-span-2 font-medium">{booking.userId?.firstName} {booking.userId?.lastName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Contact:</span>
                <span className="col-span-2 flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" /> {booking.userId?.phone}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Address:</span>
                <span className="col-span-2 text-slate-700 leading-relaxed">
                  {booking.address?.addressLine1}<br />
                  {booking.address?.addressLine2 && <>{booking.address.addressLine2}<br /></>}
                  {booking.address?.city}, {booking.address?.state} {booking.address?.pincode}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sample Collection / Tracking */}
          <Card className="print-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border print-bg">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Sample Collection Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="w-fit">{booking.collectionStatus || "Pending"}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Pref. Date:</span>
                <span className="col-span-2 font-medium">
                  {booking.metadata?.collectionDetails?.pickupDate 
                    ? format(new Date(booking.metadata?.collectionDetails?.pickupDate), "MMM d, yyyy") 
                    : "Not specified"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Pref. Time:</span>
                <span className="col-span-2 font-medium">{booking.metadata?.collectionDetails?.pickupTime || "Not specified"}</span>
              </div>
              {booking.assignedCollector?.name && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <span className="text-muted-foreground">Agent:</span>
                  <span className="col-span-2 font-medium">{booking.assignedCollector.name} ({booking.assignedCollector.contact})</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tests & Samples Detail Section */}
        <Card className="print-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border print-bg">
            <CardTitle className="text-base flex items-center gap-2"><Beaker className="h-4 w-4" /> Detailed Testing Requirements</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0 md:p-6">
            <div className="space-y-6">
              {booking.items?.map((item: any, idx: number) => (
                <div key={idx} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 print-bg">
                    <div>
                      <Badge className="mb-1 text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">{item.itemType}</Badge>
                      <h3 className="text-lg font-bold text-slate-800">{item.packageId?.name || item.testId?.testName || item.testId?.name || "Service Item"}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {item.samples && item.samples.map((sample: any, sIdx: number) => (
                      <div key={sIdx} className="bg-white rounded-md border border-slate-100 p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sample {sIdx + 1} Information</span>
                            <p className="font-semibold text-slate-800 text-base">{sample.productName || "Unknown Product"}</p>
                          </div>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600">
                            {sample.quantity && <span className="mr-2">Qty: {sample.quantity}</span>}
                            {sample.batchNumber && <span>Batch: {sample.batchNumber}</span>}
                          </Badge>
                        </div>
                        
                        {sample.sku && (
                          <p className="text-xs text-slate-500 mb-3"><span className="font-medium">SKU:</span> {sample.sku}</p>
                        )}

                        {(() => {
                           let tags: string[] = [];
                           let label = "Testing Requirements";
                           
                           if (item.itemType === 'PACKAGE') {
                             label = "Tests Included in Package";
                             if (sample.selectedTests && sample.selectedTests.length > 0) {
                               tags = sample.selectedTests;
                             } else if (item.packageId?.tests?.length > 0) {
                               tags = item.packageId.tests.map((t: any) => {
                                 const params = t.metadata?.parameters?.map((p: any) => p.name).filter(Boolean);
                                 if (params && params.length > 0) {
                                   return `${t.testName} (${params.join(', ')})`;
                                 }
                                 return t.testName || "Unknown Test";
                               });
                             } else if (item.packageId?.features?.length > 0) {
                               tags = item.packageId.features;
                             }
                           } else {
                             label = "Parameters to Test";
                             if (sample.selectedParameters && sample.selectedParameters.length > 0) {
                               tags = sample.selectedParameters;
                             } else if (item.testId?.parameters?.length > 0) {
                               tags = item.testId.parameters;
                             }
                           }

                           if (tags.length === 0) return null;

                           return (
                             <div className="mt-4">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                 {label}
                               </span>
                               <div className="flex flex-wrap gap-2">
                                 {tags.map((p: string, k: number) => (
                                   <Badge key={k} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100 font-medium px-2.5 py-1 whitespace-normal text-left">
                                     {p.startsWith("pkg-feat-") ? p.replace("pkg-feat-", "") : p}
                                   </Badge>
                                 ))}
                               </div>
                             </div>
                           );
                        })()}

                        {sample.specifics && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Specific Instructions / Notes</span>
                            <p className="text-sm text-slate-700 bg-amber-50/50 p-3 rounded border border-amber-100/50 leading-relaxed italic">
                              "{sample.specifics}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!item.samples || item.samples.length === 0) && (
                      <p className="text-sm text-slate-500 italic p-2">No sample details provided.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing Uploaded Reports (If any) */}
        {booking.reportFiles && booking.reportFiles.length > 0 && (
          <div className="no-print mt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Already Uploaded Reports</h3>
            <div className="space-y-2">
              {booking.reportFiles.map((url: string, idx: number) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all bg-card shadow-sm">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground hover:underline">Test Report Document {idx + 1}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to view in new tab</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Icon helper since lucide-react Export icon might be named differently
function UploadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
