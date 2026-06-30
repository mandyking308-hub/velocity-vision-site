import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, ClipboardPaste, PlusCircle, Sparkles } from "lucide-react";
import { parseCsv, ParsedTable } from "@/lib/dataVault/parseCsv";

interface Props {
  onParsed: (table: ParsedTable, fileName: string, fileType: "csv" | "paste" | "manual") => void;
}

export default function UploadStep({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [manualHeaders, setManualHeaders] = useState("first_name,last_name,email,company_name,job_title");
  const [manualRows, setManualRows] = useState("Jane,Doe,jane@acme.com,Acme,CEO\nJohn,Smith,john@beta.com,Beta,COO");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (f: File) => {
    setError(null);
    if (f.size > 10 * 1024 * 1024) {
      setError("File is over 10MB. Please split it first.");
      return;
    }
    const text = await f.text();
    const table = parseCsv(text);
    if (table.headers.length === 0) {
      setError("Couldn't read any columns. Is this a valid CSV?");
      return;
    }
    onParsed(table, f.name, "csv");
  };

  const handlePaste = () => {
    setError(null);
    if (!pasted.trim()) {
      setError("Paste something first.");
      return;
    }
    const table = parseCsv(pasted);
    if (table.headers.length === 0) {
      setError("Couldn't detect any columns.");
      return;
    }
    onParsed(table, `pasted-${new Date().toISOString().slice(0, 10)}.csv`, "paste");
  };

  const handleManual = () => {
    setError(null);
    const text = manualHeaders + "\n" + manualRows;
    const table = parseCsv(text);
    if (table.rows.length === 0) {
      setError("Add at least one row of data.");
      return;
    }
    onParsed(table, `manual-${new Date().toISOString().slice(0, 10)}.csv`, "manual");
  };

  return (
    <Tabs defaultValue="file" className="space-y-4">
      <TabsList>
        <TabsTrigger value="file"><FileSpreadsheet className="h-4 w-4 mr-2" />CSV file</TabsTrigger>
        <TabsTrigger value="paste"><ClipboardPaste className="h-4 w-4 mr-2" />Paste table</TabsTrigger>
        <TabsTrigger value="manual"><PlusCircle className="h-4 w-4 mr-2" />Manual entry</TabsTrigger>
        <TabsTrigger value="xlsx" disabled><Sparkles className="h-4 w-4 mr-2" />XLSX (soon)</TabsTrigger>
      </TabsList>

      <TabsContent value="file">
        <Card
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <CardContent className="p-10 text-center space-y-3">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="text-lg font-medium">Drop a CSV here, or pick a file</div>
            <div className="text-sm text-muted-foreground">Up to 10MB. We'll detect your columns automatically.</div>
            <Input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="paste">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="text-sm text-muted-foreground">Paste from a spreadsheet. First row should be your headers.</div>
            <Textarea
              rows={10}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"first_name\tlast_name\temail\tcompany\nJane\tDoe\tjane@acme.com\tAcme"}
              className="font-mono text-sm"
            />
            <Button onClick={handlePaste}>Continue</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="text-sm text-muted-foreground">Headers (comma separated)</div>
            <Input value={manualHeaders} onChange={(e) => setManualHeaders(e.target.value)} className="font-mono text-sm" />
            <div className="text-sm text-muted-foreground">Rows (one per line, comma separated)</div>
            <Textarea rows={8} value={manualRows} onChange={(e) => setManualRows(e.target.value)} className="font-mono text-sm" />
            <Button onClick={handleManual}>Continue</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="xlsx">
        <Card><CardContent className="p-10 text-center text-muted-foreground">XLSX support is coming soon. For now, export to CSV from Excel or Google Sheets.</CardContent></Card>
      </TabsContent>

      {error && <div className="text-sm text-rose-600">{error}</div>}
    </Tabs>
  );
}
