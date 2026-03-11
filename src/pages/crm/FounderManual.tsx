import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { platformManual } from "@/lib/platformManual";
import { buildLog } from "@/lib/buildLog";
import {
  AlertTriangle, Book, Search, Download, ChevronDown, ChevronRight,
  Clock, FileText, History, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const FounderManual = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChapter, setActiveChapter] = useState<string | null>("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"manual" | "buildlog">("manual");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["manual-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return data?.map((r) => r.role) ?? [];
    },
    enabled: !!user,
  });

  const hasAccess = roles?.some((r) => r === "founder" || r === "admin") ?? false;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Filter chapters/sections by search
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return platformManual;
    const q = searchQuery.toLowerCase();
    return platformManual
      .map((ch) => ({
        ...ch,
        sections: ch.sections.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q) ||
            ch.title.toLowerCase().includes(q)
        ),
      }))
      .filter((ch) => ch.sections.length > 0);
  }, [searchQuery]);

  const filteredBuildLog = useMemo(() => {
    if (!searchQuery.trim()) return buildLog;
    const q = searchQuery.toLowerCase();
    return buildLog.filter(
      (e) =>
        e.feature.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.component.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Generate Markdown for download
  const generateMarkdown = () => {
    let md = "# Velocity Influence — Platform Operations Manual\n\n";
    md += `Generated: ${format(new Date(), "d MMMM yyyy, HH:mm")}\n\n---\n\n`;

    md += "## Table of Contents\n\n";
    platformManual.forEach((ch, i) => {
      md += `${i + 1}. ${ch.title}\n`;
      ch.sections.forEach((s, j) => {
        md += `   ${i + 1}.${j + 1}. ${s.title}\n`;
      });
    });
    md += `${platformManual.length + 1}. Platform Build Log\n\n---\n\n`;

    platformManual.forEach((ch) => {
      md += `## ${ch.title}\n\n`;
      ch.sections.forEach((s) => {
        md += `### ${s.title}\n\n${s.content}\n\n`;
      });
      md += "---\n\n";
    });

    md += "## Platform Build Log\n\n";
    md += "| Date | Feature | Component | Description |\n|------|---------|-----------|-------------|\n";
    buildLog.forEach((e) => {
      md += `| ${format(new Date(e.date), "d MMM yyyy")} | ${e.feature} | ${e.component} | ${e.description.slice(0, 80)}… |\n`;
    });

    return md;
  };

  const downloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velocity-influence-manual-${format(new Date(), "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadText = () => {
    const md = generateMarkdown();
    // Simple text version (strip markdown syntax for plain text)
    const text = md.replace(/#{1,3}\s/g, "").replace(/\*\*/g, "").replace(/\|/g, " ");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velocity-influence-manual-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!hasAccess) return (
    <div className="p-8 text-center">
      <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted-foreground">This manual is restricted to founders and administrators.</p>
    </div>
  );

  // Render markdown-like content with basic formatting
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Table header
      if (line.startsWith("|") && lines[i + 1]?.startsWith("|---")) {
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        return (
          <div key={i} className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {cells.map((c, j) => (
                    <th key={j} className="text-left px-3 py-2 font-semibold text-foreground bg-muted/30">{c}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        );
      }
      // Table separator - skip
      if (line.startsWith("|---")) return null;
      // Table row (not header)
      if (line.startsWith("|") && !lines[i - 1]?.startsWith("|---") && i > 0 && (lines[i - 1]?.startsWith("|") || lines[i - 2]?.startsWith("|---"))) {
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        return (
          <div key={i} className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-border/30">
                  {cells.map((c, j) => (
                    <td key={j} className="px-3 py-1.5 text-muted-foreground" dangerouslySetInnerHTML={{
                      __html: c.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
                    }} />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      // Bullet point
      if (line.startsWith("- ")) {
        return (
          <p key={i} className="text-sm text-muted-foreground pl-4 py-0.5" dangerouslySetInnerHTML={{
            __html: "• " + line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
          }} />
        );
      }
      // Numbered item
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={i} className="text-sm text-muted-foreground pl-4 py-0.5" dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
          }} />
        );
      }
      // Blockquote
      if (line.startsWith("> ")) {
        return <blockquote key={i} className="border-l-2 border-accent pl-3 py-1 text-sm italic text-muted-foreground my-1">{line.slice(2)}</blockquote>;
      }
      // Empty line
      if (!line.trim()) return <div key={i} className="h-2" />;
      // Regular paragraph
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>')
        }} />
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Sidebar Navigation */}
      <div className="w-64 shrink-0 border-r border-border/50 bg-card overflow-y-auto">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Book size={18} className="text-accent" />
            <h2 className="font-display font-bold text-foreground text-sm">Operations Manual</h2>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            <button onClick={() => setActiveTab("manual")} className={cn("text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors", activeTab === "manual" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
              <FileText size={12} className="inline mr-1" />Manual
            </button>
            <button onClick={() => setActiveTab("buildlog")} className={cn("text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors", activeTab === "buildlog" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
              <History size={12} className="inline mr-1" />Build Log
            </button>
          </div>
        </div>

        {activeTab === "manual" && (
          <nav className="p-2 space-y-0.5">
            {platformManual.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                className={cn(
                  "w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
                  activeChapter === ch.id
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span className="text-[10px] text-muted-foreground mr-1.5">{i + 1}.</span>
                {ch.title}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                {activeTab === "manual" ? "Platform Operations Manual" : "Platform Build Log"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "manual"
                  ? `${platformManual.length} chapters · ${platformManual.reduce((s, c) => s + c.sections.length, 0)} sections`
                  : `${buildLog.length} entries · Latest: ${format(new Date(buildLog[buildLog.length - 1].date), "d MMM yyyy")}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={downloadMarkdown} className="gap-1.5 text-xs h-8">
                <Download size={12} /> Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={downloadText} className="gap-1.5 text-xs h-8">
                <Download size={12} /> Text
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl">
          {activeTab === "manual" ? (
            <>
              {filteredChapters.map((chapter) => {
                if (activeChapter && activeChapter !== chapter.id && !searchQuery) return null;
                return (
                  <div key={chapter.id} className="mb-8">
                    <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-accent/10 text-accent rounded-md flex items-center justify-center text-xs font-bold">
                        {platformManual.findIndex((c) => c.id === chapter.id) + 1}
                      </span>
                      {chapter.title}
                    </h2>
                    <div className="space-y-3">
                      {chapter.sections.map((section) => {
                        const key = `${chapter.id}-${section.title}`;
                        const isOpen = expandedSections.has(key) || !!searchQuery;
                        return (
                          <div key={key} className="border border-border/40 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleSection(key)}
                              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                            >
                              {isOpen ? <ChevronDown size={14} className="text-accent shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                              <span className="text-sm font-semibold text-foreground">{section.title}</span>
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 space-y-0.5">
                                    {renderContent(section.content)}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {filteredChapters.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No results matching "{searchQuery}"</p>
              )}
            </>
          ) : (
            /* Build Log */
            <div className="space-y-0">
              {filteredBuildLog.map((entry, i) => (
                <div key={i} className="flex gap-4 pb-6 relative">
                  {/* Timeline line */}
                  {i < filteredBuildLog.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border/50" />
                  )}
                  {/* Dot */}
                  <div className="w-[31px] shrink-0 flex justify-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-accent border-2 border-background shadow-sm" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 bg-card border border-border/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />{format(new Date(entry.date), "d MMM yyyy")}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{entry.component}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{entry.feature}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
                  </div>
                </div>
              ))}
              {filteredBuildLog.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No build log entries matching "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderManual;
