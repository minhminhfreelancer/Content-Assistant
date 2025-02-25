import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SearchResult } from "@/types/search";
import { CONTENT_TEMPLATES } from "@/lib/templates";
import { ModelConfig } from "../ContentWizard";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Step3ReviewProps {
  results: SearchResult[];
  modelConfig: ModelConfig;
  onBack: () => void;
  onNext: (analysis: string, keyword: string, research: string) => void;
}

const DEFAULT_PROMPT = `This is research content about articles on [keyword]: [CONTENT]

Please analyze and provide:
1. Common article structures
2. Main and secondary sections
3. Key points mentioned
4. Unique perspectives from each article
5. Strengths/weaknesses of each article
6. Opportunities for differentiation
7. Content type (choose 1): Pillar Content/Supporting Content/Informational Content/Commercial Content/Engagement Content/News/Updates`;

const Step3Review = ({
  results,
  modelConfig,
  onBack,
  onNext,
}: Step3ReviewProps) => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [contentType, setContentType] = useState("pillar");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!results.length) return;

    setIsProcessing(true);
    try {
      // Enhance search results with more context
      const content = results
        .map((result) => {
          // Extract key points from title
          const titlePoints = result.title
            .split(/[-–—:]/) // Split on common title separators
            .map((p) => p.trim())
            .filter((p) => p.length > 10); // Only keep meaningful segments

          // Clean and structure the snippet
          const cleanSnippet = result.snippet
            .replace(/\.\.\./g, ".") // Remove ellipsis
            .split(/[.!?]/) // Split into sentences
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .join(". ");

          return `# ${result.title}

Source: ${result.url}

Key Points:
${titlePoints.map((p) => `- ${p}`).join("\n")}

Summary:
${cleanSnippet}

---
`;
        })
        .join("\n");

      // Use the keyword passed from Step2Search
      const keyword = results[0]?.searchKeyword || "";

      // Store content in memory
      const researchPrompt = prompt.replace("[CONTENT]", content);

      // Move to next step with analysis, keyword and research content
      onNext(researchPrompt, keyword, content);
    } catch (error) {
      console.error("Error processing content:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Step 3: Review Command</h2>
          <p className="text-sm text-muted-foreground">
            Customize the analysis command and select content type
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Type Template</label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTENT_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {contentType && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Structure</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  {CONTENT_TEMPLATES[contentType].template.structure.map(
                    (item, index) => (
                      <div key={index}>{item}</div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Optimization Tips</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  {CONTENT_TEMPLATES[contentType].template.optimization.map(
                    (item, index) => (
                      <div key={index}>• {item}</div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Analysis Command</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-xs text-slate-500">
            Customize the analysis command. Use [CONTENT] as placeholder for the
            research content.
          </p>
        </div>

        <Button
          onClick={handleProcess}
          className="w-full"
          disabled={isProcessing || !results.length}
        >
          {isProcessing ? "Processing..." : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default Step3Review;
