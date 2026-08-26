import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Info, Edit, Plus, Beaker } from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

export default function LabTestsPage() {
  const navigate = useNavigate();

  const { data: testsData, isLoading } = useQuery({
    queryKey: ["labTests"],
    queryFn: labApi.getMyLabTests,
  });

  const tests = testsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Laboratory Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage standard and custom test protocols offered by your facility</p>
        </div>
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
          <Link to="/lab/tests/new">
            <Plus className="h-4 w-4" /> Add Test Protocol
          </Link>
        </Button>
      </div>

      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Test Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Price (₹)</TableHead>
                <TableHead className="font-semibold text-slate-700">Offer Price (₹)</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Info className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-slate-700">No tests found</span>
                      <p className="text-xs text-muted-foreground">Add your first test protocol to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tests.map((t: any) => (
                <TableRow key={t._id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {t.imageUrl || t.icon ? (
                        <img
                          src={t.imageUrl || t.icon}
                          alt={t.testName}
                          className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                          <Beaker className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-semibold text-slate-900 max-w-[200px] truncate" title={t.testName}>
                        {t.testName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.approvalStatus || "PENDING"} />
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">₹{t.price?.toLocaleString() || 0}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {t.offerPrice ? `₹${t.offerPrice.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate text-rose-600">
                    {t.rejectionReason && (
                      <span className="flex items-center gap-1 font-medium" title={t.rejectionReason}>
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {t.rejectionReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.creatorType === 'LAB' ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => navigate(`/lab/tests/edit/${t._id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-slate-100/80 text-slate-600 border-slate-200 font-medium">Platform Test</Badge>
                    )}
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
