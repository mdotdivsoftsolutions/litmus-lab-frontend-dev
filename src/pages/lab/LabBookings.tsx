import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Upload, 
  Loader2, 
  Beaker, 
  Search, 
  FileText, 
  Truck, 
  Copy, 
  MapPin, 
  FlaskConical, 
  Calendar, 
  CreditCard, 
  Activity, 
  Receipt, 
  Layers, 
  UserCheck, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { labApi } from "@/lib/api/lab";
import { toast } from "sonner";
import { format } from "date-fns";
import { InvoiceModal } from "@/components/InvoiceModal";

export default function LabBookings() {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [collectionStatus, setCollectionStatus] = useState<string>("");
  const [collectorName, setCollectorName] = useState<string>("");
  const [collectorContact, setCollectorContact] = useState<string>("");
  const [notifyDelay, setNotifyDelay] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['lab-bookings'],
    queryFn: () => labApi.getMyLabBookings(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => labApi.updateLabBookingStatus(id, status),
    onSuccess: (data) => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['lab-bookings'] });
      // Update selected booking
      if (selectedBooking) {
        setSelectedBooking(data.data);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  });

  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => labApi.updateCollectionDetails(id, data),
    onSuccess: (data) => {
      toast.success("Collection details updated successfully");
      queryClient.invalidateQueries({ queryKey: ['lab-bookings'] });
      if (selectedBooking) {
        setSelectedBooking(data.data);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update collection details");
    }
  });

  const handleUpdateStatus = () => {
    if (selectedBooking && selectedStatus) {
      updateStatusMutation.mutate({ id: selectedBooking._id, status: selectedStatus });
    }
  };

  const handleUpdateCollection = () => {
    if (selectedBooking) {
      updateCollectionMutation.mutate({ 
        id: selectedBooking._id, 
        data: { status: collectionStatus, collectorName, collectorContact, notifyDelay }
      });
    }
  };

  const bookings = response?.data || [];

  const filteredBookings = bookings.filter((b: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "new" && b.status === "PENDING") return true;
    if (activeTab === "inprogress" && b.status === "IN_PROGRESS") return true;
    if (activeTab === "completed" && b.status === "COMPLETED") return true;
    return false;
  });

  const getPrimaryProductName = (b: any) => {
    if (!b.items || b.items.length === 0) return "Custom Order";
    const firstItem = b.items[0];
    if (firstItem.itemType === 'TEST' && firstItem.testId) return firstItem.testId.testName;
    if (firstItem.itemType === 'PACKAGE' && firstItem.packageId) return firstItem.packageId.name;
    return "Custom Order";
  };



  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <Card className="border border-border shadow-sm overflow-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><div className="flex gap-1"><Skeleton className="h-8 w-16 rounded-md" /><Skeleton className="h-8 w-20 rounded-md" /></div></TableCell>
                  </TableRow>
                ))
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b: any) => (
                  <TableRow key={b._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium font-mono text-sm">{b._id.substring(b._id.length - 8).toUpperCase()}</TableCell>
                    <TableCell>{b.userId?.firstName} {b.userId?.lastName}</TableCell>
                    <TableCell>{getPrimaryProductName(b)}</TableCell>
                    <TableCell><Badge variant="secondary">{b.items?.length || 0}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(b.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs" onClick={() => {
                          setSelectedBooking(b);
                          setSelectedStatus(b.status);
                          setCollectionStatus(b.collectionStatus || "PENDING");
                          setCollectorName(b.assignedCollector?.name || "");
                          setCollectorContact(b.assignedCollector?.contact || "");
                          setNotifyDelay(false);
                        }}>
                          <Eye className="h-3.5 w-3.5" />View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 h-8 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                          onClick={() => setInvoiceBookingId(b._id)}
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Invoice
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs" asChild>
                          <Link to={`/lab/bookings/${b._id}/upload`}><Upload className="h-3.5 w-3.5" />Upload</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      {/* Booking Detail Sheet (Admin Panel Style) */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-slate-50 border-l border-slate-200 shadow-2xl overflow-hidden font-sans">
          {selectedBooking && (() => {
            const b = selectedBooking;
            const displayId = `#${b._id.substring(b._id.length - 8).toUpperCase()}`;
            const isCourierMethod = 
              b.collectionMethod === 'COURIER' ||
              b.metadata?.collectionMethod === 'COURIER' ||
              b.metadata?.collectionDetails?.collectionMethod === 'COURIER';
            const courierInfo = b.courierDetails || b.metadata?.courierDetails || {};
            const collectionDetails = b.metadata?.collectionDetails || {};
            const userFullName = `${b.userId?.firstName || ''} ${b.userId?.lastName || ''}`.trim() || 'Valued Customer';
            const rawItems = b.items || [];
            const totalSamplesCount = rawItems.reduce((acc: number, item: any) => acc + (item.samples?.length || 0), 0);
            const isPaymentPaid = b.paymentStatus === 'PAID' || b.paymentStatus === 'COMPLETED' || b.paymentStatus === 'SUCCESS';
            const hasReports = b.reportFiles && b.reportFiles.length > 0;
            const isComplete = b.status?.toUpperCase() === 'COMPLETED';

            const copyToClipboard = (text: string, label: string) => {
              if (!text) return;
              navigator.clipboard.writeText(text);
              toast.success(`${label} copied to clipboard`);
            };

            return (
              <>
                {/* Drawer Header */}
                <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-white shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary text-white font-bold flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                        <FlaskConical className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                            {displayId}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-700"
                            onClick={() => copyToClipboard(b._id, "Full Booking ID")}
                            title="Copy full Booking ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Placed on {format(new Date(b.createdAt), 'MMM dd, yyyy · hh:mm a')}</span>
                          <span>•</span>
                          <span className="text-slate-700 font-medium">{userFullName}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Header Badges Ribbon */}
                  <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                    <StatusBadge status={b.status} />
                    
                    <Badge variant="outline" className={isPaymentPaid 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold gap-1"
                      : "bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold gap-1"
                    }>
                      <CreditCard className="h-3 w-3" />
                      {isPaymentPaid ? "Payment Paid" : `Payment: ${b.paymentStatus || "PENDING"}`}
                    </Badge>

                    {isCourierMethod ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[11px] font-semibold gap-1">
                        <Truck className="h-3 w-3 text-blue-600" /> Courier Dispatch
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold gap-1">
                        <MapPin className="h-3 w-3 text-amber-600" /> Doorstep Pickup
                      </Badge>
                    )}

                    {hasReports && (
                      <Badge className="bg-emerald-600 text-white text-[11px] font-semibold gap-1">
                        <FileText className="h-3 w-3" /> Report Uploaded
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                  
                  {/* 4 Metric Overview Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>Lifecycle</span>
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate">{b.status}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {isComplete ? "Order finalized" : "In workflow"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>Payment</span>
                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{isPaymentPaid ? "Paid" : "Pending"}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate">
                          {b.paymentMethod || "Online Gateway"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>Amount</span>
                        <Receipt className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          Incl. GST
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 shadow-2xs rounded-xl p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>Samples</span>
                        <Layers className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {totalSamplesCount} Sample{totalSamplesCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {rawItems.length} order item{rawItems.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Profile Card */}
                  <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          <UserCheck className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer & Contact Information</h4>
                          <p className="text-[11px] text-muted-foreground">Client ownership & contact details</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Customer Name</span>
                          <p className="font-bold text-slate-900">{userFullName}</p>
                          {b.userId?.companyName && (
                            <p className="text-[11px] text-slate-600 font-medium mt-0.5">{b.userId.companyName}</p>
                          )}
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone Contact</span>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 font-mono">
                              {collectionDetails?.phone || b.userId?.phone || "N/A"}
                            </p>
                            {b.userId?.phone && (
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800" onClick={() => copyToClipboard(b.userId.phone, "Phone")}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email Address</span>
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 truncate" title={collectionDetails?.email || b.userId?.email}>
                              {collectionDetails?.email || b.userId?.email || "N/A"}
                            </p>
                            {b.userId?.email && (
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800" onClick={() => copyToClipboard(b.userId.email, "Email")}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location Box */}
                      {collectionDetails?.address && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                                Sample Collection / Dispatch Address
                              </span>
                              <p className="text-slate-800 leading-relaxed font-medium">
                                {collectionDetails.address}, {collectionDetails.city}, {collectionDetails.state} - {collectionDetails.pincode}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs px-2.5 shrink-0 bg-white border-slate-200"
                            onClick={() => copyToClipboard(`${collectionDetails.address}, ${collectionDetails.city}, ${collectionDetails.state} - ${collectionDetails.pincode}`, "Address")}
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Sample Courier Dispatch & Logistics Section */}
                  <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCourierMethod ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {isCourierMethod ? <Truck className="h-4 w-4 text-blue-700" /> : <MapPin className="h-4 w-4 text-amber-700" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {isCourierMethod ? "Sample Courier Dispatch & Receipt" : "Doorstep Collection Schedule"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            {isCourierMethod ? "Customer self-shipment tracking & lab receipt verification" : "Assigned collection agent and status"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {isCourierMethod ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                                Tracking / AWB Number
                              </span>
                              {courierInfo.trackingId ? (
                                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 break-all">
                                  <span>{courierInfo.trackingId}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 text-blue-600 hover:text-blue-900" 
                                    onClick={() => copyToClipboard(courierInfo.trackingId, "Tracking ID")}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-amber-700 italic font-medium">Not updated yet by customer</span>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                                Courier Partner
                              </span>
                              <p className="font-semibold text-blue-950">{courierInfo.courierName || "Unspecified"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                                Dispatched On
                              </span>
                              <p className="font-semibold text-blue-950">
                                {courierInfo.submittedAt ? format(new Date(courierInfo.submittedAt), "MMM d, yyyy · hh:mm a") : "Pending dispatch"}
                              </p>
                            </div>
                          </div>

                          {courierInfo.notes && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Customer Dispatch Notes</span>
                              <p className="text-slate-800 italic">"{courierInfo.notes}"</p>
                            </div>
                          )}

                          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">Sample Receipt State at Lab</label>
                              <Select value={collectionStatus} onValueChange={setCollectionStatus}>
                                <SelectTrigger className="h-9 bg-white text-xs border-slate-200">
                                  <SelectValue placeholder="Receipt Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">PENDING (Awaiting Dispatch)</SelectItem>
                                  <SelectItem value="SHIPPED">SHIPPED (In Transit)</SelectItem>
                                  <SelectItem value="COLLECTED">COLLECTED / RECEIVED AT LAB</SelectItem>
                                  <SelectItem value="NOT_REQUIRED">NOT REQUIRED</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Button 
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-xs" 
                              onClick={handleUpdateCollection}
                              disabled={updateCollectionMutation.isPending}
                            >
                              {updateCollectionMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                              Update Sample Receipt Status
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/40 p-3 rounded-lg border border-amber-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">Preferred Date</span>
                              <p className="font-bold text-amber-950">
                                {collectionDetails.pickupDate ? format(new Date(collectionDetails.pickupDate), "MMM d, yyyy") : "Not specified"}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">Preferred Time Slot</span>
                              <p className="font-bold text-amber-950">{collectionDetails.pickupTime || "Not specified"}</p>
                            </div>
                          </div>

                          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Collection Status</label>
                                <Select value={collectionStatus} onValueChange={setCollectionStatus}>
                                  <SelectTrigger className="h-9 bg-white text-xs border-slate-200">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NOT_REQUIRED">Not Required</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                    <SelectItem value="REACHED">Reached</SelectItem>
                                    <SelectItem value="COLLECTED">Collected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Collector Name</label>
                                <Input 
                                  placeholder="Agent name" 
                                  value={collectorName}
                                  onChange={(e) => setCollectorName(e.target.value)}
                                  className="h-9 text-xs bg-white border-slate-200"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Phone</label>
                                <Input 
                                  placeholder="Phone number" 
                                  value={collectorContact}
                                  onChange={(e) => setCollectorContact(e.target.value)}
                                  className="h-9 text-xs bg-white font-mono border-slate-200"
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                              <Checkbox id="notifyDelayLab" checked={notifyDelay} onCheckedChange={(c) => setNotifyDelay(!!c)} />
                              <label htmlFor="notifyDelayLab" className="text-xs text-muted-foreground font-medium cursor-pointer">
                                Notify user of delay via email
                              </label>
                            </div>
                            <Button 
                              size="sm"
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-xs" 
                              onClick={handleUpdateCollection}
                              disabled={updateCollectionMutation.isPending}
                            >
                              {updateCollectionMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                              Save Collection Details
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>

                  {/* Ordered Diagnostic Tests & Samples */}
                  <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                          <Beaker className="h-4 w-4 text-indigo-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ordered Diagnostic Tests & Samples</h4>
                          <p className="text-[11px] text-muted-foreground">Testing parameters, matrices, SKUs & sample details</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-xs font-bold">
                        {rawItems.length} Item{rawItems.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-4">
                      {rawItems.map((item: any, idx: number) => {
                        const itemTitle = item.packageId?.name || item.testId?.testName || item.testId?.name || "Diagnostic Service Item";
                        return (
                          <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
                            <div className="bg-slate-50/90 px-3.5 py-2.5 flex justify-between items-center border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-xs text-slate-900">{itemTitle}</span>
                                <Badge className="text-[9px] uppercase tracking-wider py-0 px-1.5 bg-slate-200/70 text-slate-700 border-0 font-bold">
                                  {item.itemType}
                                </Badge>
                              </div>
                              <span className="font-bold text-xs text-slate-900">₹{(item.price || 0).toLocaleString("en-IN")}</span>
                            </div>

                            <div className="p-3.5 space-y-3">
                              {item.samples && item.samples.map((sample: any, sIdx: number) => (
                                <div key={sIdx} className="p-3 bg-slate-50/60 rounded-lg border border-slate-100 space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span className="font-bold text-xs text-slate-900">{sample.productName || "Standard Sample"}</span>
                                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium font-mono">
                                      {sample.quantity && <span>Qty: <strong>{sample.quantity}</strong></span>}
                                      {sample.batchNumber && <span>Batch: <strong>{sample.batchNumber}</strong></span>}
                                      {sample.sku && <span>SKU: <strong>{sample.sku}</strong></span>}
                                    </div>
                                  </div>

                                  {/* Parameters */}
                                  {(() => {
                                    let tags: string[] = [];
                                    if (item.itemType === 'PACKAGE') {
                                      if (sample.selectedTests?.length > 0) tags = sample.selectedTests;
                                      else if (item.packageId?.tests?.length > 0) tags = item.packageId.tests.map((t: any) => t.testName || t.name);
                                      else if (item.packageId?.features?.length > 0) tags = item.packageId.features;
                                    } else {
                                      if (sample.selectedParameters?.length > 0) tags = sample.selectedParameters;
                                      else if (item.testId?.parameters?.length > 0) tags = item.testId.parameters;
                                    }
                                    if (!tags || tags.length === 0) return null;

                                    return (
                                      <div className="pt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                          {item.itemType === 'PACKAGE' ? 'Tests Included' : 'Parameters'} ({tags.length})
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {tags.map((tag: string, k: number) => (
                                            <span key={k} className="inline-block bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-medium px-2 py-0.5 shadow-2xs">
                                              {tag.replace(/^pkg-feat-/, '')}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {sample.specifics && (
                                    <div className="pt-1 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                                      <span className="font-bold text-[10px] uppercase text-slate-400 block">Specific Instructions:</span>
                                      {sample.specifics}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Certified Reports & Results */}
                  <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          <FileText className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Test Reports & Documents</h4>
                          <p className="text-[11px] text-muted-foreground">Certified diagnostic certificates and reports</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 bg-white border-slate-200" asChild>
                        <Link to={`/lab/bookings/${b._id}/upload`}>
                          <Upload className="h-3 w-3" /> Upload Report
                        </Link>
                      </Button>
                    </div>

                    <div className="p-4">
                      {hasReports ? (
                        <div className="space-y-2">
                          {b.reportFiles.map((url: string, idx: number) => (
                            <a 
                              key={idx} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all bg-slate-50/60 shadow-2xs group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    Certified Report Document #{idx + 1}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">Click to view or download PDF in new tab</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary font-medium">
                                View <Eye className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                          <FileText className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-700">No test reports attached yet</p>
                          <p className="text-[11px] text-muted-foreground mb-3">Upload testing results and certified analytical reports for customer release</p>
                          <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs" asChild>
                            <Link to={`/lab/bookings/${b._id}/upload`}>
                              <Upload className="h-3.5 w-3.5" /> Upload Test Report
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Lifecycle Status Management Card */}
                  <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Update Booking Lifecycle Status</h4>
                          <p className="text-[11px] text-muted-foreground">Progress order through lab testing phases</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Status</label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="h-9 bg-white text-xs border-slate-200">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending (Received)</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress (Testing Underway)</SelectItem>
                            <SelectItem value="COMPLETED">Completed (Testing Concluded)</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-xs" 
                        onClick={handleUpdateStatus}
                        disabled={updateStatusMutation.isPending || selectedStatus === b.status}
                      >
                        {updateStatusMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                        Update Order Status
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Fixed Drawer Footer */}
                <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedBooking(null)}
                    className="text-xs border-slate-200 text-slate-600 h-9"
                  >
                    Close
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-bold h-9 shadow-2xs"
                      onClick={() => setInvoiceBookingId(b._id)}
                    >
                      <Receipt className="h-4 w-4 text-emerald-600" /> Tax Invoice
                    </Button>

                    <Button 
                      size="sm"
                      className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-xs"
                      asChild
                    >
                      <Link to={`/lab/bookings/${b._id}`}>
                        Full Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* GST Tax Invoice Modal */}
      <InvoiceModal
        bookingId={invoiceBookingId}
        open={!!invoiceBookingId}
        onOpenChange={(open) => !open && setInvoiceBookingId(null)}
      />
    </div>
  );
}
