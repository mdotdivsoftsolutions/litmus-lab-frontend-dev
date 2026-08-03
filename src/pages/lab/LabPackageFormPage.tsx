import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Package as PackageIcon, PackagePlus, Library, Tag, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { labApi } from "@/lib/api/lab";

export default function LabPackageFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [creationMode, setCreationMode] = useState<'UNSELECTED' | 'EXISTING' | 'CUSTOM'>(isEditing ? 'CUSTOM' : 'UNSELECTED');
  const [selectedPlatformPackageId, setSelectedPlatformPackageId] = useState<string>("");

  const [category, setCategory] = useState("routine");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    mrp: "",
    price: "",
    tat: "",
    testCount: 1,
  });

  const { data: platformPackagesData, isLoading: isLoadingPlatformPackages } = useQuery({
    queryKey: ["platformPackages"],
    queryFn: labApi.getPlatformPackages,
    enabled: creationMode === 'EXISTING',
  });

  const availablePlatformPackages = platformPackagesData?.data || [];

  const { data: testsData } = useQuery({
    queryKey: ["labTests"],
    queryFn: labApi.getMyLabTests,
    enabled: creationMode === 'CUSTOM',
  });

  const labTests = testsData?.data || [];

  const addExistingMutation = useMutation({
    mutationFn: (packageId: string) => labApi.addExistingPackageToLab(packageId),
    onSuccess: () => {
      toast.success("Platform package added to your lab successfully!");
      queryClient.invalidateQueries({ queryKey: ["labPackages"] });
      navigate("/lab/packages");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add platform package");
    }
  });

  const handleAddExisting = () => {
    if (!selectedPlatformPackageId) {
      toast.error("Please select a platform package first");
      return;
    }
    addExistingMutation.mutate(selectedPlatformPackageId);
  };

  const { data: allLabPackagesData, isLoading: isLoadingEditingPackage } = useQuery({
    queryKey: ["labPackages"],
    queryFn: labApi.getMyLabPackages,
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && allLabPackagesData?.data) {
      const pkg = allLabPackagesData.data.find((p: any) => p._id === id);
      if (pkg) {
        setFormData({
          name: pkg.name || "",
          description: pkg.description || "",
          mrp: pkg.mrp?.toString() || "",
          price: pkg.price?.toString() || "",
          tat: pkg.tat || "",
          testCount: pkg.testCount || 1,
        });
        setCategory(pkg.category || "routine");
        setSelectedTests(pkg.tests?.map((t: any) => t._id || t) || []);
      }
    }
  }, [isEditing, allLabPackagesData, id]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => isEditing ? labApi.updateMyLabPackage(id!, data) : labApi.createMyLabPackage(data),
    onSuccess: () => {
      toast.success(isEditing ? "Package updated successfully! Sent for re-approval." : "Package created successfully! Sent for approval.");
      queryClient.invalidateQueries({ queryKey: ["labPackages"] });
      navigate("/lab/packages");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save package");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Package Name is required");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      mrp: Number(formData.mrp),
      price: Number(formData.price),
      category: category,
      testCount: selectedTests.length > 0 ? selectedTests.length : Number(formData.testCount || 1),
      tests: selectedTests,
      tat: formData.tat,
    };

    saveMutation.mutate(payload);
  };

  if (isEditing && isLoadingEditingPackage) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading package details...</div>;
  }

  // Auto-calculate MRP based on selected tests
  useEffect(() => {
    if (selectedTests.length > 0 && labTests.length > 0) {
      const calculatedMrp = selectedTests.reduce((sum, testId) => {
        const test = labTests.find((t: any) => t._id === testId);
        return sum + (test?.price || 0);
      }, 0);
      setFormData((prev: any) => ({ ...prev, mrp: calculatedMrp.toString() }));
    }
  }, [selectedTests, labTests]);

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/lab/packages"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Custom Package" : "Add New Package"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Update your custom laboratory package details." : "Add a package to your laboratory's catalog."}
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
              <CardTitle className="text-xl">Platform Package</CardTitle>
              <CardDescription className="text-sm mt-2">
                Select from our extensive library of standard platform packages. These are pre-configured with tests and pricing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setCreationMode('CUSTOM')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PackagePlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Custom Package</CardTitle>
              <CardDescription className="text-sm mt-2">
                Create a completely new package tailored specifically to your laboratory's unique offerings by bundling your existing tests.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {creationMode === 'EXISTING' && (
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle>Select Platform Package</CardTitle>
            <CardDescription>Choose a standard package from the platform library to add to your catalog.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-xl">
              <Label>Available Platform Packages</Label>
              {isLoadingPlatformPackages ? (
                <div className="h-10 border rounded-md bg-muted/20 flex items-center px-3">
                  <span className="text-sm text-muted-foreground animate-pulse">Loading platform packages...</span>
                </div>
              ) : availablePlatformPackages.length === 0 ? (
                <div className="p-6 border rounded-md bg-muted/30 text-center space-y-2">
                  <Library className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">All Caught Up!</p>
                  <p className="text-xs text-muted-foreground">You have already added all available platform packages to your catalog.</p>
                </div>
              ) : (
                <Select value={selectedPlatformPackageId} onValueChange={setSelectedPlatformPackageId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a package..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatformPackages.map((p: any) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} <span className="text-muted-foreground ml-2">(₹{p.price})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={() => setCreationMode('UNSELECTED')}>Back</Button>
              <Button onClick={handleAddExisting} disabled={!selectedPlatformPackageId || addExistingMutation.isPending || availablePlatformPackages.length === 0}>
                {addExistingMutation.isPending ? "Adding..." : "Add to Lab Catalog"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {creationMode === 'CUSTOM' && (
        <div className="mt-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-primary" />
                Package Details
              </CardTitle>
              <CardDescription>
                Bundle your laboratory's tests into a cohesive package.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name <span className="text-destructive">*</span></Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Comprehensive Health Check" required className="bg-background/50" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="specialized">Specialized</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="condition">Condition Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tat">Turn Around Time <span className="text-destructive">*</span></Label>
                    <Input id="tat" name="tat" value={formData.tat} onChange={handleChange} placeholder="e.g. 24-48 Hours" required className="bg-background/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the purpose and contents of this package..." rows={3} required className="bg-background/50" />
                </div>

                <div className="space-y-2 pt-4 border-t border-border/50">
                  <Label>Select Tests for Package</Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3 bg-muted/20">
                    {labTests.map((t: any) => (
                      <div key={t._id} className="flex items-center space-x-3 bg-background p-2 rounded-md border shadow-sm">
                        <Checkbox 
                          id={`test-${t._id}`} 
                          checked={selectedTests.includes(t._id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedTests(prev => [...prev, t._id]);
                            else setSelectedTests(prev => prev.filter(id => id !== t._id));
                          }}
                        />
                        <Label htmlFor={`test-${t._id}`} className="text-sm font-normal cursor-pointer flex-1">
                          {t.testName} <span className="text-muted-foreground ml-2">(₹{t.price})</span>
                        </Label>
                      </div>
                    ))}
                    {labTests.length === 0 && <div className="text-sm text-center py-4 text-muted-foreground">No tests available. You must create tests before bundling them into a package.</div>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="testCount">Total Tests</Label>
                    <Input id="testCount" name="testCount" type="number" value={selectedTests.length > 0 ? selectedTests.length : formData.testCount} onChange={handleChange} readOnly={selectedTests.length > 0} min="1" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mrp">Original Value (MRP) (₹) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="mrp" name="mrp" type="number" className="pl-9 bg-background/50" value={formData.mrp} onChange={handleChange} required min="0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Offer Price (₹) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="price" name="price" type="number" className="pl-9 bg-background/50" value={formData.price} onChange={handleChange} required min="0" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="ghost" onClick={() => setCreationMode('UNSELECTED')} className="text-muted-foreground">
                  Change Mode
                </Button>
              )}
            </div>
            
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-48 bg-litmus-emerald hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              {saveMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Submit for Approval")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
