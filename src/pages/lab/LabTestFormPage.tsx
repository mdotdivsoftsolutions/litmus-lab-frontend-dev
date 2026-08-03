import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Beaker, FileText, Plus, Trash2, Library, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { testTypeApi } from "@/lib/api/testType";
import { labApi } from "@/lib/api/lab";

const stepLabels = ["Basic Details", "Parameters & Pricing"];

export default function LabTestFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [creationMode, setCreationMode] = useState<'UNSELECTED' | 'EXISTING' | 'CUSTOM'>(isEditing ? 'CUSTOM' : 'UNSELECTED');
  const [selectedPlatformTestId, setSelectedPlatformTestId] = useState<string>("");

  const [step, setStep] = useState(0);
  const [tatValue, setTatValue] = useState("");
  const [tatUnit, setTatUnit] = useState("hours");
  const [formData, setFormData] = useState<any>({
    testName: "",
    description: "",
    price: "",
    offerPrice: "",
    discountType: "NONE",
    discountValue: "",
    turnAroundTime: "",
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
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">FSSAI Reference Method</Label>
                      <Input value={formData.metadata.method} onChange={(e) => handleMetadataChange("method", e.target.value)} placeholder="e.g. IS:1479" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Test Type</Label>
                      <Select value={formData.metadata.type} onValueChange={(val) => handleMetadataChange("type", val)}>
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent>
                          {testTypesData?.data?.map((type: any) => (
                            <SelectItem key={type._id} value={type.name}>{type.name}</SelectItem>
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

                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">Detailed Description</Label>
                    <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the testing methodology and purpose..." className="min-h-[120px] bg-background/50" />
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
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-40 bg-litmus-emerald hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                {saveMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Submit for Approval")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
