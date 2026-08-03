import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, AlertCircle, Package as PackageIcon } from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabPackagesPage() {
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["labPackages"],
    queryFn: labApi.getMyLabPackages,
  });

  const packages = packagesData?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500">Pending Approval</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Packages</h1>
        <Button asChild>
          <Link to="/lab/packages/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Package
          </Link>
        </Button>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Package Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Original (₹)</TableHead>
                <TableHead>Litmus Price (₹)</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackageIcon className="h-8 w-8 text-muted-foreground/50" />
                      <span>No packages found. Add one to get started!</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : packages.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={p.name}>
                    {p.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(p.approvalStatus)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-400 line-through">₹{p.mrp?.toLocaleString() || 0}</TableCell>
                  <TableCell className="font-medium text-emerald-600">
                    ₹{p.price?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate text-destructive">
                    {p.rejectionReason && (
                      <span className="flex items-center gap-1" title={p.rejectionReason}>
                        <AlertCircle className="h-3 w-3" /> {p.rejectionReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/lab/packages/edit/${p._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
