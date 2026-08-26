import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, AlertCircle, Package as PackageIcon } from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

export default function LabPackagesPage() {
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["labPackages"],
    queryFn: labApi.getMyLabPackages,
  });

  const packages = packagesData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage bundled diagnostic test health packages offered by your lab</p>
        </div>
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
          <Link to="/lab/packages/new">
            <Plus className="h-4 w-4" /> Add New Package
          </Link>
        </Button>
      </div>

      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Package Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Original (₹)</TableHead>
                <TableHead className="font-semibold text-slate-700">Litmus Price (₹)</TableHead>
                <TableHead className="font-semibold text-slate-700">Rejection Reason</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <PackageIcon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-slate-700">No packages found</span>
                      <p className="text-xs text-muted-foreground">Add your first bundled test package to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : packages.map((p: any) => (
                <TableRow key={p._id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-semibold text-slate-900 max-w-[200px] truncate" title={p.name}>
                    {p.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize bg-slate-100/80 text-slate-700 border-slate-200 font-medium">{p.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.approvalStatus || "PENDING"} />
                  </TableCell>
                  <TableCell className="font-medium text-slate-400 line-through">₹{p.mrp?.toLocaleString() || 0}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ₹{p.price?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate text-rose-600">
                    {p.rejectionReason && (
                      <span className="flex items-center gap-1 font-medium" title={p.rejectionReason}>
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {p.rejectionReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg" asChild>
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
