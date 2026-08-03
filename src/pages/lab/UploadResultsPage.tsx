import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ArrowLeft, Loader2, FileText, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { labApi } from "@/lib/api/lab";
import { uploadApi } from "@/lib/api/uploadApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UploadResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: response, isLoading } = useQuery({
    queryKey: ["labBookings"],
    queryFn: labApi.getMyLabBookings,
  });

  const submitResultMutation = useMutation({
    mutationFn: (data: { reportUrl: string }) => labApi.submitResult(id as string, data),
    onSuccess: () => {
      toast.success("Result uploaded successfully");
      navigate("/lab/bookings");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit result");
      setIsUploading(false);
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const rawBookings = response?.data || [];
  const booking = rawBookings.find((b: any) => b._id === id);

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button onClick={() => navigate("/lab/bookings")}>Back to Bookings</Button>
      </div>
    );
  }

  const displayId = `BKG-${booking._id.substring(booking._id.length - 6).toUpperCase()}`;
  const userName = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim() || "Unknown User";
  
  // Get product names
  let productName = "Custom Order";
  if (booking.items && booking.items.length > 0) {
    const firstItem = booking.items[0];
    if (firstItem.itemType === 'TEST' && firstItem.testId) productName = firstItem.testId.testName;
    else if (firstItem.itemType === 'PACKAGE' && firstItem.packageId) productName = firstItem.packageId.name;
  }

  const testsCount = booking.items?.reduce((count: number, i: any) => count + (i.samples?.length || 0), 0) || booking.items?.length || 0;
  const amount = booking.totalAmount || 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedUrl(null);
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        const uploadRes = await uploadApi.uploadFile(file, (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        const fileUrl = uploadRes.data?.url || uploadRes.url || uploadRes.data || uploadRes;
        setUploadedUrl(fileUrl);
        setIsUploading(false);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to upload file");
        setSelectedFile(null);
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      toast.error("Please wait for the file to finish uploading");
      return;
    }
    submitResultMutation.mutate({ reportUrl: uploadedUrl });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/lab/bookings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Results</h1>
          <p className="text-sm text-muted-foreground">{displayId} · {productName} · {userName}</p>
        </div>
      </div>

      {/* Booking summary */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Product</p><p className="font-medium">{productName}</p></div>
            <div><p className="text-muted-foreground text-xs">User</p><p className="font-medium">{userName}</p></div>
            <div><p className="text-muted-foreground text-xs">Items</p><p className="font-medium">{testsCount} samples</p></div>
            <div><p className="text-muted-foreground text-xs">Amount</p><p className="font-medium text-primary">₹{amount.toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="text-base">Tests Required</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {booking.items?.map((item: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-border p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{item.testId?.testName || item.packageId?.name || "Service Item"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Type: {item.itemType}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {booking.reportFiles && booking.reportFiles.length > 0 && (
        <Card className="border border-border shadow-sm bg-primary/5">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Already Uploaded Reports</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {booking.reportFiles.map((url: string, idx: number) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors bg-background shadow-sm">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground hover:underline">Test Report Document {idx + 1}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click to view in new tab</p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border border-border shadow-sm">
        <CardHeader><CardTitle className="text-base">Upload Report PDF/Image</CardTitle></CardHeader>
        <CardContent>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="application/pdf,image/*" 
            disabled={isUploading || submitResultMutation.isPending}
          />
          <div 
            onClick={() => {
              if (!isUploading && !submitResultMutation.isPending) {
                fileInputRef.current?.click();
              }
            }}
            className={cn("flex items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors", 
              isUploading || submitResultMutation.isPending 
                ? "border-primary/50 bg-primary/5 cursor-wait" 
                : "border-border hover:border-primary cursor-pointer bg-muted/20"
            )}
          >
            <div className="flex flex-col items-center gap-2 text-center w-full">
              {isUploading ? (
                <div className="w-full max-w-xs mx-auto space-y-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="font-medium text-foreground">
                      Uploading Report... {uploadProgress}%
                    </p>
                  </div>
                  <Progress value={uploadProgress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground">Please wait while the file is being processed</p>
                </div>
              ) : selectedFile && uploadedUrl ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Upload Complete · Ready to submit
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium text-foreground">Click to browse or upload report file</p>
                  <p className="text-sm text-muted-foreground">PDF or Image · Max 50MB</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary-deep" 
        onClick={handleSubmit} 
        disabled={!uploadedUrl || submitResultMutation.isPending}
      >
        {submitResultMutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Results...</>
        ) : (
          "Submit Results"
        )}
      </Button>
    </div>
  );
}
