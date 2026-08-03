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
import { Eye, Upload, Loader2, Beaker, Search, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { labApi } from "@/lib/api/lab";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LabBookings() {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
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
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                          setSelectedBooking(b);
                          setSelectedStatus(b.status);
                          setCollectionStatus(b.collectionStatus || "PENDING");
                          setCollectorName(b.assignedCollector?.name || "");
                          setCollectorContact(b.assignedCollector?.contact || "");
                          setNotifyDelay(false);
                        }}>
                          <Eye className="h-3.5 w-3.5" />View
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
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

      {/* Booking Detail Sheet */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {selectedBooking && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  #{selectedBooking._id.substring(selectedBooking._id.length - 8).toUpperCase()}
                  <StatusBadge status={selectedBooking.status} />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground text-xs">User</p>
                    <p className="font-medium">{selectedBooking.userId?.firstName} {selectedBooking.userId?.lastName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedBooking.userId?.phone}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-muted-foreground text-xs">Primary Product</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {Array.from(new Set(selectedBooking.items?.map((i: any) => i.itemType))).filter(Boolean).map((t: any) => (
                           <Badge key={t} className="text-[9px] uppercase tracking-wider px-1.5 py-0 bg-primary/10 text-primary border-primary/20">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="font-medium">{getPrimaryProductName(selectedBooking)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-muted-foreground text-xs">Total Items</p>
                      <Badge className="text-[9px] uppercase tracking-wider px-1.5 py-0 bg-slate-200 text-slate-700 border-0">
                         {selectedBooking.items?.reduce((count: number, i: any) => count + (i.samples?.length || 0), 0) || 0} Samples
                      </Badge>
                    </div>
                    <p className="font-medium">{selectedBooking.items?.length || 0} order items</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">{format(new Date(selectedBooking.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 col-span-2">
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="font-medium text-primary">₹{selectedBooking.totalAmount?.toLocaleString() || 0}</p>
                  </div>
                </div>

                {/* Sample Collection Arrangement */}
                <div className="border-t border-border pt-4 mt-6">
                  <h4 className="text-sm font-semibold mb-3">Sample Collection Arrangement</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="rounded-lg bg-muted/20 border border-border p-3">
                      <p className="text-muted-foreground text-xs">Preferred Date</p>
                      <p className="font-medium">{selectedBooking.metadata?.collectionDetails?.pickupDate ? format(new Date(selectedBooking.metadata?.collectionDetails?.pickupDate), "MMM d, yyyy") : "Not specified"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 border border-border p-3">
                      <p className="text-muted-foreground text-xs">Preferred Time</p>
                      <p className="font-medium">{selectedBooking.metadata?.collectionDetails?.pickupTime || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-muted/10 p-3 rounded-lg border border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Collection Status</label>
                        <Select value={collectionStatus} onValueChange={setCollectionStatus}>
                          <SelectTrigger className="h-9">
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
                        <label className="text-xs font-medium text-muted-foreground">Collector Name</label>
                        <Input 
                          placeholder="Name" 
                          value={collectorName}
                          onChange={(e) => setCollectorName(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Contact</label>
                        <Input 
                          placeholder="Phone number" 
                          value={collectorContact}
                          onChange={(e) => setCollectorContact(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pb-1">
                      <Checkbox id="notifyDelayLab" checked={notifyDelay} onCheckedChange={(c) => setNotifyDelay(!!c)} />
                      <label htmlFor="notifyDelayLab" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Notify user of delay via email
                      </label>
                    </div>
                    <Button 
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-1" 
                      onClick={handleUpdateCollection}
                      disabled={updateCollectionMutation.isPending}
                    >
                      {updateCollectionMutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Save Collection Details
                    </Button>
                  </div>
                </div>

                {/* Items/Sample Details */}
                <div className="border-t border-border pt-4 mt-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Beaker className="h-4 w-4" /> Booking Items & Samples</h4>
                  <div className="space-y-4">
                    {selectedBooking.items?.map((item: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-md overflow-hidden text-sm shadow-sm">
                        <div className="flex justify-between font-medium bg-muted/50 p-3 border-b border-border">
                          <span>{item.itemType} - {item.packageId?.name || item.testId?.testName || item.testId?.name || "Custom"}</span>
                          <span>₹{item.price}</span>
                        </div>
                        <div className="p-3 space-y-4 bg-card">
                          {item.samples && item.samples.map((sample: any, sIdx: number) => (
                             <div key={sIdx} className="border-b border-border pb-3 last:border-0 last:pb-0">
                               <div className="mb-2">
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Product Info</span>
                                 <p className="font-semibold text-foreground">{sample.productName || "Unknown Product"}</p>
                                 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                   {sample.quantity && <span>Qty: <span className="font-medium text-slate-700">{sample.quantity}</span></span>}
                                   {sample.batchNumber && <span>Batch: <span className="font-medium text-slate-700">{sample.batchNumber}</span></span>}
                                   {sample.sku && <span>SKU: <span className="font-medium text-slate-700">{sample.sku}</span></span>}
                                 </div>
                               </div>
                               {((sample.selectedParameters && sample.selectedParameters.length > 0) || (sample.selectedTests && sample.selectedTests.length > 0)) && (
                               <div className="mb-2">
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                                   {item.itemType === 'PACKAGE' ? 'Tests Included' : 'Parameters'}
                                 </span>
                                 <div className="flex flex-wrap gap-1">
                                   {((item.itemType === 'PACKAGE' && sample.selectedTests?.length > 0) ? sample.selectedTests : sample.selectedParameters).map((p: string, k: number) => (
                                     <Badge key={k} variant="secondary" className="font-normal text-[10px] px-1.5 py-0">
                                       {p.startsWith("pkg-feat-") ? p.replace("pkg-feat-", "") : p}
                                     </Badge>
                                   ))}
                                 </div>
                               </div>
                               )}
                               {sample.specifics && (
                                 <div>
                                   <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Specifics</span>
                                   <p className="text-xs bg-muted/30 p-2 rounded leading-relaxed">{sample.specifics}</p>
                                 </div>
                               )}
                             </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Reports */}
                {selectedBooking.reportFiles && selectedBooking.reportFiles.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Uploaded Reports</h4>
                    <div className="space-y-2">
                      {selectedBooking.reportFiles.map((url: string, idx: number) => (
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

                {/* Status Update */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3">Update Status</h4>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full mt-3 bg-primary hover:bg-primary-deep" 
                    onClick={handleUpdateStatus}
                    disabled={updateStatusMutation.isPending || selectedStatus === selectedBooking.status}
                  >
                    {updateStatusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Status
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button className="w-full gap-2" variant="outline" asChild>
                    <Link to={`/lab/bookings/${selectedBooking._id}`}><Eye className="h-4 w-4" />Detailed View</Link>
                  </Button>
                  <Button className="w-full gap-2" variant="outline" asChild>
                    <Link to={`/lab/bookings/${selectedBooking._id}/upload`}><Upload className="h-4 w-4" />Upload Results</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
