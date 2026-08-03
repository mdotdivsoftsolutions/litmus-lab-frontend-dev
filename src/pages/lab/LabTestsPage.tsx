import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Info, Edit, Plus } from "lucide-react";
import { labApi } from "@/lib/api/lab";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabTestsPage() {
  const navigate = useNavigate();

  const { data: testsData, isLoading } = useQuery({
    queryKey: ["labTests"],
    queryFn: labApi.getMyLabTests,
  });

  const tests = testsData?.data || [];

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
        <h1 className="text-2xl font-bold text-foreground">My Tests</h1>
        <Button asChild>
          <Link to="/lab/tests/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Test
          </Link>
        </Button>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Test Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Offer Price (₹)</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="h-8 w-8 text-muted-foreground/50" />
                      <span>No tests found. Add one to get started!</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tests.map((t: any) => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={t.testName}>
                    {t.testName}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(t.approvalStatus)}
                  </TableCell>
                  <TableCell className="font-medium">₹{t.price?.toLocaleString() || 0}</TableCell>
                  <TableCell className="font-medium text-emerald-600">
                    {t.offerPrice ? `₹${t.offerPrice.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate text-destructive">
                    {t.rejectionReason && (
                      <span className="flex items-center gap-1" title={t.rejectionReason}>
                        <AlertCircle className="h-3 w-3" /> {t.rejectionReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.creatorType === 'LAB' ? (
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/lab/tests/edit/${t._id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Platform Test</Badge>
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
