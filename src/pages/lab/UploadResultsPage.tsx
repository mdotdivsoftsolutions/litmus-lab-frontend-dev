import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, Loader2, FileText, CheckCircle, Lightbulb, ShieldCheck, FileCheck, HelpCircle } from "lucide-react";
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

  // Remarks state
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [tips, setTips] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [hasInitializedRemarks, setHasInitializedRemarks] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ["labBookings"],
    queryFn: labApi.getMyLabBookings,
  });

  const rawBookings = response?.data || [];
  const booking = rawBookings.find((b: any) => b._id === id);

  useEffect(() => {
    if (booking && !hasInitializedRemarks) {
      if (booking.reportSummary) {
        setSummary(booking.reportSummary.summary || "");
        setRecommendations(booking.reportSummary.recommendations || "");
        setTips(booking.reportSummary.tips || "");
        setAdditionalNotes(booking.reportSummary.additionalNotes || "");
      }
      if (booking.reportFiles && booking.reportFiles.length > 0) {
        setUploadedUrl(booking.reportFiles[0]);
      }
      setHasInitializedRemarks(true);
    }
  }, [booking, hasInitializedRemarks]);

  const submitResultMutation = useMutation({
    mutationFn: (data: { reportUrl?: string; reportFiles?: string[]; summary: string; recommendations: string; tips: string; additionalNotes: string }) =>
      labApi.submitResult(id as string, data),
    onSuccess: () => {
      toast.success("Test report and remarks saved successfully");
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
        toast.success("Document uploaded to storage");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to upload file");
        setSelectedFile(null);
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const finalReportUrl = uploadedUrl || (booking.reportFiles && booking.reportFiles[0]);
    if (!finalReportUrl) {
      toast.error("Please upload the test report file (PDF or Image) first");
      return;
    }
    submitResultMutation.mutate({
      reportUrl: finalReportUrl,
      summary: summary.trim(),
      recommendations: recommendations.trim(),
      tips: tips.trim(),
      additionalNotes: additionalNotes.trim(),
    });
  };

  const hasExistingReport = Boolean(booking.reportFiles && booking.reportFiles.length > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/lab/bookings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Report & Summary</h1>
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

      {/* Upload File Card */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> Report Document (PDF or Image)
          </CardTitle>
          <CardDescription>
            Upload the official signed lab certificate or test analytical report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            className={cn("flex items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors", 
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
              ) : selectedFile ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> New file uploaded and ready
                  </p>
                </>
              ) : hasExistingReport ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="font-medium text-foreground">Existing Report Attached</p>
                  <p className="text-xs text-muted-foreground">Click to replace with a new PDF or Image</p>
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

          {booking.reportFiles && booking.reportFiles.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current file link:</p>
              <a 
                href={booking.reportFiles[0]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-md"
              >
                <FileText className="h-3.5 w-3.5" /> View Current Document In New Tab
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary, Recommendations, Tips, Additional Notes */}
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" /> Report Summary & Technical Remarks
          </CardTitle>
          <CardDescription>
            These details will be reviewed by Admin and presented directly to the user alongside the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 1. Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-summary" className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <FileText className="h-4 w-4 text-primary" /> 1. Executive Summary
              </Label>
              <span className="text-[11px] text-muted-foreground">Overview & key parameters</span>
            </div>
            <Textarea
              id="report-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Sample complies with FSSAI regulations for microbial and nutritional limits. Moisture content was recorded at 12.4%, and heavy metal levels are well within safe thresholds..."
              className="min-h-[90px] text-sm bg-background/50 focus:bg-background"
            />
          </div>

          {/* 2. Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-recommendations" className="text-sm font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 2. Actionable Recommendations
              </Label>
              <span className="text-[11px] text-muted-foreground">Compliance & safety advice</span>
            </div>
            <Textarea
              id="report-recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="e.g. Recommend maintaining batch moisture under 14% to prevent mold growth during transit. Packaging should be hermetically sealed..."
              className="min-h-[90px] text-sm bg-background/50 focus:bg-background"
            />
          </div>

          {/* 3. Tips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-tips" className="text-sm font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Lightbulb className="h-4 w-4 text-amber-600" /> 3. Tips & Best Practices
              </Label>
              <span className="text-[11px] text-muted-foreground">Storage, hygiene & shelf-life</span>
            </div>
            <Textarea
              id="report-tips"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="e.g. Store in a cool, dry place below 25°C away from direct sunlight. Ensure FIFO (First-In, First-Out) stock rotation..."
              className="min-h-[90px] text-sm bg-background/50 focus:bg-background"
            />
          </div>

          {/* 4. Additional Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-notes" className="text-sm font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <HelpCircle className="h-4 w-4 text-slate-500" /> 4. Additional Notes & Disclaimers
              </Label>
              <span className="text-[11px] text-muted-foreground">Standards, protocols & remarks</span>
            </div>
            <Textarea
              id="report-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Tests performed in accordance with IS/ISO 17025 standards. Results relate strictly to the sample received..."
              className="min-h-[90px] text-sm bg-background/50 focus:bg-background"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate("/lab/bookings")}>Cancel</Button>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary-deep text-white gap-2" 
          onClick={handleSubmit} 
          disabled={submitResultMutation.isPending || isUploading}
        >
          {submitResultMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting Results...</>
          ) : hasExistingReport ? (
            "Update Report & Remarks"
          ) : (
            "Submit Results"
          )}
        </Button>
      </div>
    </div>
  );
}
