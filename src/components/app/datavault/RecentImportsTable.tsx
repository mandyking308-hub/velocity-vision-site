import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface RecentImport {
  id: string;
  file_name: string;
  created_at: string;
  row_count: number;
  status: string;
  summary?: any;
}

export default function RecentImportsTable({ imports, readOnly = false }: { imports: RecentImport[]; readOnly?: boolean }) {
  if (imports.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        No imports yet. Upload your first list to get started.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground border-b border-border">
          <tr>
            <th className="py-2 font-medium">File</th>
            <th className="py-2 font-medium">Uploaded</th>
            <th className="py-2 font-medium">Rows</th>
            <th className="py-2 font-medium">Created</th>
            <th className="py-2 font-medium">Duplicates</th>
            <th className="py-2 font-medium">Eligible under checks</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {imports.map((i) => {
            const s = i.summary || {};
            return (
              <tr key={i.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5">
                  {readOnly ? (
                    <span className="font-medium">{i.file_name}</span>
                  ) : (
                    <Link to={`/app/data-vault/imports/${i.id}`} className="font-medium text-primary hover:underline">
                      {i.file_name}
                    </Link>
                  )}
                </td>
                <td className="py-2.5 text-muted-foreground">{format(new Date(i.created_at), "d MMM, HH:mm")}</td>
                <td className="py-2.5">{i.row_count}</td>
                <td className="py-2.5">{s.created ?? "—"}</td>
                <td className="py-2.5">{s.duplicates ?? "—"}</td>
                <td className="py-2.5">{s.safe_to_send ?? "—"}</td>
                <td className="py-2.5">
                  <Badge variant={i.status === "imported" ? "default" : "secondary"} className="capitalize">{i.status}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
