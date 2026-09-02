import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Beaker, FileText, Plus, Trash2, Library, FlaskConical, Upload, ImageIcon, Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { testTypeApi } from "@/lib/api/testType";
import { categoryApi } from "@/lib/api/category";
import { labApi } from "@/lib/api/lab";
import { uploadApi } from "@/lib/api/uploadApi";

const stepLabels = ["Basic Details", "Parameters & Pricing"];

export default function LabTestFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [creationMode, setCreationMode] = useState<'UNSELECTED' | 'EXISTING' | 'CUSTOM'>(isEditing ? 'CUSTOM' : 'UNSELECTED');
  const [selectedPlatformTestId, setSelectedPlatformTestId] = useState<string>("");

  const [step, setStep] = useState(0);
  const [tatValue, setTatValue] = useState("");
  const [tatUnit, setTatUnit] = useState("hours");
  const [formData, setFormData] = useState<any>({
    testName: "",
    description: "",
    imageUrl: "",
    icon: "",
    price: "",
    offerPrice: "",
    discountType: "NONE",
    discountValue: "",
    turnAroundTime: "",
    applicableCategories: [],
    applicableSubcategories: [],
    metadata: {
      method: "",
      type: "",
      parameters: [{ name: "", unit: "", minLimit: "", maxLimit: "", price: "" }]
    }
  });

  const { data: platformTestsData, isLoading: isLoadingPlatformTests } = useQuery({
    queryKey: ["platformTests"],
    queryFn: labApi.getPlatformTests,
    enabled: creationMode === 'EXISTING',
  });

  const { data: testTypesData } = useQuery({
    queryKey: ["testTypes"],
    queryFn: () => testTypeApi.getTestTypes(),
    enabled: creationMode === 'CUSTOM',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories(),
    enabled: creationMode === 'CUSTOM',
  });

  const categories = categoriesData?.data?.data || categoriesData?.data || [];
  const availablePlatformTests = platformTestsData?.data || [];

  const addExistingMutation = useMutation({
    mutationFn: (testId: string) => labApi.addExistingTestToLab(testId),
    onSuccess: () => {
      toast.success("Platform test added to your lab successfully!");
      queryClient.invalidateQueries({ queryKey: ["labTests"] });
      navigate("/lab/tests");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add platform test");
    }
  });

  const handleAddExisting = () => {
    if (!selectedPlatformTestId) {
      toast.error("Please select a platform test first");
      return;
    }
    addExistingMutation.mutate(selectedPlatformTestId);
  };

  // --- Custom Test Form Logic --- //

  // If editing, we fetch all tests to find the one we are editing. 
  // (In a real app, you might have a getTestById for labs, but here we can just use the list since it's already cached usually)
  const { data: allLabTestsData, isLoading: isLoadingEditingTest } = useQuery({
    queryKey: ["labTests"],
    queryFn: labApi.getMyLabTests,
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && allLabTestsData?.data) {
      const test = allLabTestsData.data.find((t: any) => t._id === id);
      if (test) {
        // Parse Turn Around Time
        let tValue = "";
        let tUnit = "hours";
        const tat = test.turnAroundTime || "";
        if (tat) {
          const match = tat.match(/(\d+)/);
          if (match) {
            const num = parseInt(match[0]);
            if (tat.toLowerCase().includes('day') || tat.toLowerCase().includes('d')) {
              tValue = num.toString();
              tUnit = "days";
            } else {
              if (num > 0 && num % 24 === 0) {
                tValue = (num / 24).toString();
                tUnit = "days";
              } else {
                tValue = num.toString();
                tUnit = "hours";
              }
            }
          }
        }
        setTatValue(tValue);
        setTatUnit(tUnit);

        setFormData({
          testName: test.testName || "",
          description: test.description || "",
          imageUrl: test.imageUrl || test.icon || "",
          icon: test.icon || test.imageUrl || "",
          price: test.price?.toString() || "",
          offerPrice: test.offerPrice?.toString() || "",
          discountType: test.discountType || "NONE",
          discountValue: test.discountValue?.toString() || "",
          turnAroundTime: tat,
          metadata: {
            method: test.metadata?.method || "",
            type: test.metadata?.type || "",
            parameters: test.metadata?.parameters?.length > 0 ? test.metadata.parameters : [{ name: "", unit: "", minLimit: "", maxLimit: "", price: "" }]
          }
        });
      }
    }
  }, [isEditing, allLabTestsData, id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadFile(file);
      const url = res.data?.url || res.url || res.data || res;
      if (url) {
        setFormData((prev: any) => ({
          ...prev,
          imageUrl: url,
          icon: url,
        }));
        toast.success("Test icon uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload test icon");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev: any) => ({
      ...prev,
      imageUrl: "",
      icon: "",
    }));
  };

  const saveMutation = useMutation({
    mutationFn: (data: any) => isEditing ? labApi.updateMyLabTest(id!, data) : labApi.createMyLabTest(data),
    onSuccess: () => {
      toast.success(isEditing ? "Test updated successfully! Sent for re-approval." : "Test created successfully! Sent for approval.");
      queryClient.invalidateQueries({ queryKey: ["labTests"] });
      navigate("/lab/tests");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save test");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, [key]: value }
    });
  };

  const addParameterRow = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        parameters: [...formData.metadata.parameters, { name: "", unit: "", minLimit: "", maxLimit: "", price: "" }]
      }
    });
  };

  const removeParameterRow = (index: number) => {
    const newParams = [...formData.metadata.parameters];
    newParams.splice(index, 1);
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, parameters: newParams }
    });
  };

  const handleParameterChange = (index: number, field: string, value: string) => {
    const newParams = [...formData.metadata.parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, parameters: newParams }
    });
  };

  const handleSave = () => {
    if (!formData.testName) {
      toast.error("Test Name is required");
      return;
    }

    let finalTat = formData.turnAroundTime;
    if (tatValue) {
      if (tatUnit === "days") {
        finalTat = `${parseInt(tatValue) * 24}hr`;
      } else {
        finalTat = `${tatValue}hr`;
      }
    }

    const calculatedBasePrice = formData.metadata.parameters.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0);
    
    let calculatedOfferPrice = calculatedBasePrice;
    if (formData.discountType === 'FLAT') {
      calculatedOfferPrice = Math.max(0, calculatedBasePrice - (Number(formData.discountValue) || 0));
    } else if (formData.discountType === 'PERCENTAGE') {
      calculatedOfferPrice = Math.max(0, calculatedBasePrice - (calculatedBasePrice * ((Number(formData.discountValue) || 0) / 100)));
    }

    // Default values if no parameters have price
    const finalBasePrice = calculatedBasePrice > 0 ? calculatedBasePrice : Number(formData.price) || 0;
    const finalOfferPrice = formData.discountType !== 'NONE' && formData.discountValue ? calculatedOfferPrice : (Number(formData.offerPrice) || undefined);

    saveMutation.mutate({
      ...formData,
      turnAroundTime: finalTat,
      price: finalBasePrice,
      offerPrice: finalOfferPrice,
      discountType: formData.discountType,
      discountValue: formData.discountType !== 'NONE' ? Number(formData.discountValue) : 0,
    });
  };

  if (isEditing && isLoadingEditingTest) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading test details...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/lab/tests"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Custom Test" : "Add New Test"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Update your custom laboratory test details." : "Add a test to your laboratory's catalog."}
          </p>
        </div>
      </div>

      {creationMode === 'UNSELECTED' && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setCreationMode('EXISTING')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Platform Test</CardTitle>
              <CardDescription className="text-sm mt-2">
                Select from our extensive library of standard platform tests. These are pre-configured with parameters and pricing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setCreationMode('CUSTOM')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Custom Test</CardTitle>
              <CardDescription className="text-sm mt-2">
                Create a completely new test tailored specifically to your laboratory's unique offerings and capabilities.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {creationMode === 'EXISTING' && (
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle>Select Platform Test</CardTitle>
            <CardDescription>Choose a standard test from the platform library to add to your catalog.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-xl">
              <Label>Available Platform Tests</Label>
              {isLoadingPlatformTests ? (
                <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                  <span className="text-sm text-muted-foreground animate-pulse">Loading platform tests...</span>
                </div>
              ) : availablePlatformTests.length === 0 ? (
                <div className="p-6 border rounded-md bg-muted/30 text-center space-y-2">
                  <Library className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">All Caught Up!</p>
                  <p className="text-xs text-muted-foreground">You have already added all available platform tests to your catalog.</p>
                </div>
              ) : (
                <Select value={selectedPlatformTestId} onValueChange={setSelectedPlatformTestId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a test..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatformTests.map((t: any) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.testName} <span className="text-muted-foreground ml-2">(₹{t.offerPrice || t.price})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={() => setCreationMode('UNSELECTED')}>Back</Button>
              <Button onClick={handleAddExisting} disabled={!selectedPlatformTestId || addExistingMutation.isPending || availablePlatformTests.length === 0}>
                {addExistingMutation.isPending ? "Adding..." : "Add to Lab Catalog"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {creationMode === 'CUSTOM' && (
        <div className="mt-6">
          <div className="flex w-full mb-8 border-b border-border">
            {stepLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none",
                  step === i 
                    ? "border-primary text-primary bg-primary/5" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                {step === 0 && <FileText className="h-5 w-5 text-primary" />}
                {step === 1 && <Beaker className="h-5 w-5 text-primary" />}
                {stepLabels[step]}
              </CardTitle>
              <CardDescription>
                {step === 0 && "Provide the fundamental details about your custom test."}
                {step === 1 && "Configure the test parameters and set pricing."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {step === 0 && (
                <div className="space-y-6 animate-fade-in w-full">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Test Name <span className="text-destructive">*</span></Label>
                    <Input name="testName" value={formData.testName} onChange={handleChange} placeholder="e.g. Specialized Chemical Analysis" className="bg-background/50" />
                  </div>

                  {/* Test Icon / Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Test Icon / Image</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-border bg-background/50">
                      <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 group">
                        {formData.imageUrl ? (
                          <>
                            <img
                              src={formData.imageUrl}
                              alt="Test Icon"
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove icon"
                            >
                              <Trash2 className="h-5 w-5 text-rose-300" />
                            </button>
                          </>
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="gap-1.5 text-xs font-semibold"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3.5 w-3.5" /> Upload Test Icon
                              </>
                            )}
                          </Button>
                          {formData.imageUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="text-destructive hover:bg-destructive/10 text-xs"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP or SVG (recommended square icon).
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">FSSAI Reference Method</Label>
                      <Input value={formData.metadata.method} onChange={(e) => handleMetadataChange("method", e.target.value)} placeholder="e.g. IS:1479" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-sm font-semibold text-slate-800">Test Classification</Label>
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-muted-foreground hover:text-primary transition-colors cursor-help inline-flex">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs p-3 space-y-1.5 bg-slate-900 text-slate-50 border-slate-800 shadow-xl">
                              <p className="font-bold text-white">Test Scientific Classification</p>
                              <p className="text-slate-300 leading-normal">
                                Categorizes testing methodology into disciplines (e.g. Nutritional, Chemical, Microbiological, Physical).
                              </p>
                              <p className="text-emerald-400 font-medium pt-1.5 border-t border-slate-700/80 text-[11px] leading-tight">
                                Note: Standard platform classifications are configured in Admin Master Catalog.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={formData.metadata.type || undefined} onValueChange={(val) => handleMetadataChange("type", val)}>
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Classification" /></SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set([
                              "Nutritional",
                              "Chemical",
                              "Microbiological",
                              "Physical",
                              ...(testTypesData?.data?.map((type: any) => type.name) || []),
                              ...(formData.metadata?.type ? [formData.metadata.type] : []),
                            ])
                          ).map((typeOpt) => (
                            <SelectItem key={typeOpt} value={typeOpt}>{typeOpt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Turn Around Time</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          value={tatValue} 
                          onChange={(e) => setTatValue(e.target.value)} 
                          placeholder="e.g. 24" 
                          className="bg-background/50" 
                        />
                        <Select value={tatUnit} onValueChange={setTatUnit}>
                          <SelectTrigger className="w-[120px] bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Category & Subcategory Selection */}
                  <div className="space-y-4 pt-2 border-t border-border/50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category Applicability (Optional)</Label>
                      <p className="text-xs text-muted-foreground">Select the product category this custom test applies to:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {categories.map((cat: any) => {
                          const isCatSelected = (formData.applicableCategories || []).includes(cat._id);
                          return (
                            <label
                              key={cat._id}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors text-xs font-medium",
                                isCatSelected ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border hover:bg-muted/50 text-slate-700"
                              )}
                            >
                              <input
                                type="checkbox"
                                className="accent-primary"
                                checked={isCatSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, applicableCategories: [...(formData.applicableCategories || []), cat._id] });
                                  } else {
                                    setFormData({ ...formData, applicableCategories: (formData.applicableCategories || []).filter((id: string) => id !== cat._id) });
                                  }
                                }}
                              />
                              <span className="truncate">{cat.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {formData.applicableCategories.length > 0 && (() => {
                      const selectedCats = categories.filter((c: any) => (formData.applicableCategories || []).includes(c._id));
                      const subcategoriesAvailable = selectedCats.flatMap((c: any) =>
                        (c.subcategories || []).map((s: any) => ({ name: s.name, categoryName: c.name }))
                      );

                      if (subcategoriesAvailable.length === 0) return null;

                      return (
                        <div className="space-y-2 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
                          <Label className="text-xs font-semibold text-slate-900">Target Subcategories (Optional)</Label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {subcategoriesAvailable.map((sub: any, idx: number) => {
                              const isSubSelected = (formData.applicableSubcategories || []).includes(sub.name);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    const current = formData.applicableSubcategories || [];
                                    if (isSubSelected) {
                                      setFormData({
                                        ...formData,
                                        applicableSubcategories: current.filter((s: string) => s !== sub.name)
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        applicableSubcategories: [...current, sub.name]
                                      });
                                    }
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1",
                                    isSubSelected
                                      ? "bg-primary text-white border-primary"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                  )}
                                >
                                  <span>{sub.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">Detailed Description</Label>
                    <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the testing methodology and purpose..." className="min-h-[100px] bg-background/50" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 max-w-xs">
                      <Label className="text-sm font-medium">Standard Base Price (₹) <span className="text-destructive">*</span></Label>
                      {formData.metadata.parameters.some((p: any) => p.price) ? (
                        <Input name="price" type="number" value={formData.metadata.parameters.reduce((sum: number, p: any) => sum + (Number(p.price) || 0), 0)} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                      ) : (
                        <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 500" className="bg-background/50" />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Calculated automatically if parameter prices are set, otherwise enter manually.</p>
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <Label className="text-sm font-medium">Discount Offer</Label>
                      <div className="flex gap-2">
                        <Select value={formData.discountType} onValueChange={(val) => setFormData({...formData, discountType: val, discountValue: val === 'NONE' ? '' : formData.discountValue})}>
                          <SelectTrigger className="w-[120px] bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">No Offer</SelectItem>
                            <SelectItem value="FLAT">Flat (₹)</SelectItem>
                            <SelectItem value="PERCENTAGE">Percent (%)</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.discountType !== 'NONE' && (
                          <Input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} placeholder={formData.discountType === 'PERCENTAGE' ? "e.g. 10" : "e.g. 100"} className="bg-background/50 flex-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <h3 className="text-lg font-semibold">Test Parameters</h3>
                      <Button variant="outline" size="sm" onClick={addParameterRow} className="gap-2 h-8 text-xs">
                        <Plus className="h-3 w-3" /> Add Parameter
                      </Button>
                    </div>
                    
                    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                      <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                        <div className="col-span-3">Parameter Name</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-2">Min Limit</div>
                        <div className="col-span-2">Max Limit</div>
                        <div className="col-span-2">Price (₹)</div>
                        <div className="col-span-1 text-center">Action</div>
                      </div>
                      
                      {formData.metadata.parameters.map((param: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-center group">
                          <div className="col-span-3">
                            <Input value={param.name} onChange={(e) => handleParameterChange(i, "name", e.target.value)} placeholder="e.g. Saturated Fat" className="h-9 text-sm bg-background" />
                          </div>
                          <div className="col-span-2">
                            <Input value={param.unit} onChange={(e) => handleParameterChange(i, "unit", e.target.value)} placeholder="e.g. %" className="h-9 text-sm bg-background" />
                          </div>
                          <div className="col-span-2">
                            <Input value={param.minLimit} onChange={(e) => handleParameterChange(i, "minLimit", e.target.value)} placeholder="0.0" className="h-9 text-sm bg-background" />
                          </div>
                          <div className="col-span-2">
                            <Input value={param.maxLimit} onChange={(e) => handleParameterChange(i, "maxLimit", e.target.value)} placeholder="10.0" className="h-9 text-sm bg-background" />
                          </div>
                          <div className="col-span-2">
                            <Input type="number" value={param.price} onChange={(e) => handleParameterChange(i, "price", e.target.value)} placeholder="150" className="h-9 text-sm bg-background border-primary/30" />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Button variant="ghost" size="icon" onClick={() => removeParameterRow(i)} className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {formData.metadata.parameters.length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          No parameters defined. Add parameters that will be checked in this test.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="ghost" onClick={() => setCreationMode('UNSELECTED')} className="text-muted-foreground">
                  Change Mode
                </Button>
              )}
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="w-32">
                Back
              </Button>
            </div>
            
            {step < 1 ? (
              <Button onClick={() => setStep(step + 1)} className="w-32 bg-primary hover:bg-primary-deep shadow-md shadow-primary/20">
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                {saveMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Submit for Approval")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
