import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

const DOC_TYPES = ["campaign_report", "strategy_document", "creative_asset", "performance_summary", "contact_list", "brand_guidelines", "campaign_brief", "other"];

const PortalDocuments = () => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("other");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: documents } = useQuery({
    queryKey: ["portal-documents", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("client_documents").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId || !user) return;

    setUploading(true);
    const filePath = `${companyId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // Store the storage path (not a public URL) — bucket is private; we mint signed URLs on demand.
    const { error } = await supabase.from("client_documents").insert({
      company_id: companyId,
      name: file.name,
      document_type: docType,
      file_url: filePath,
      file_size: file.size,
      uploaded_by: user.id,
    });

    if (error) {
      toast.error("Failed to save document record");
    } else {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["portal-documents"] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDownload = async (doc: { file_url: string; name: string }) => {
    // file_url may be a legacy public URL or a storage path. Normalize to a storage path.
    let path = doc.file_url;
    const marker = "/client-documents/";
    const idx = path.indexOf(marker);
    if (idx !== -1) path = path.substring(idx + marker.length);

    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-documents"] });
      toast.success("Document deleted");
    },
  });

  const filtered = filterType === "all" ? documents : documents?.filter((d) => d.document_type === filterType);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Documents & Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Access campaign reports, assets and documents</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="cursor-pointer">
            <Button variant="cta" disabled={uploading} className="gap-2" asChild>
              <span><Upload size={16} />{uploading ? "Uploading..." : "Upload"}</span>
            </Button>
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filterType === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterType("all")}>All</Button>
        {DOC_TYPES.map((t) => (
          <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm" onClick={() => setFilterType(t)}>
            {t.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {(filtered ?? []).map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-accent shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">{doc.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.document_type.replace(/_/g, " ")} · {format(new Date(doc.created_at), "MMM d, yyyy")}
                  {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                <Download size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(doc.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-muted-foreground text-sm text-center py-12">No documents found</p>
        )}
      </div>
    </div>
  );
};

export default PortalDocuments;
