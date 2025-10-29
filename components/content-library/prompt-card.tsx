import { Prompt } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { typeNames, typeIcons } from "@/components/content-type-selector";

interface PromptCardProps {
  prompt: Prompt;
  onUsePrompt: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, onUsePrompt }: PromptCardProps) {
  const Icon =
    typeIcons[prompt.content_type as keyof typeof typeIcons] || typeIcons.stats;
  const typeName =
    typeNames[prompt.content_type as keyof typeof typeNames] || "Unknown";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {prompt.prompt_name || `Prompt #${prompt.id}`}
            </h3>
          </div>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {typeName}
          </span>
        </div>
        <p className="mt-4 text-sm text-gray-600 line-clamp-4">
          {prompt.prompt_content}
        </p>
      </div>
      <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-200">
        <Button
          onClick={() => onUsePrompt(prompt)}
          className="w-full"
          variant="outline"
        >
          Use Prompt
        </Button>
      </div>
    </div>
  );
}
