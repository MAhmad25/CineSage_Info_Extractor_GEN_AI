import { CornerRightUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

export function AIInput({ id = "ai-input", placeholder = "Type your message...", minHeight = 58, maxHeight = 132, onSubmit, disabled = false, className }) {
      const { textareaRef, adjustHeight } = useAutoResizeTextarea({
            minHeight,
            maxHeight,
      });
      const [inputValue, setInputValue] = useState("");

      const handleSubmit = () => {
            if (!inputValue.trim() || disabled) return;
            onSubmit?.(inputValue);
            setInputValue("");
            adjustHeight(true);
      };

      return (
            <div className={cn("w-full py-4", className)}>
                  <div className="prompt-input relative max-w-xl w-full mx-auto">
                        <Textarea
                              id={id}
                              placeholder={placeholder}
                              className={cn("prompt-textarea max-w-xl rounded-3xl pl-6 pr-16", "text-wrap", "overflow-y-auto resize-none", "focus-visible:ring-0 focus-visible:ring-offset-0", "transition-[height] duration-100 ease-out", "leading-[1.2] py-[16px]")}
                              style={{ minHeight, maxHeight }}
                              ref={textareaRef}
                              value={inputValue}
                              disabled={disabled}
                              onChange={(e) => {
                                    const nextValue = e.target.value;
                                    setInputValue(nextValue);

                                    if (!nextValue.trim()) {
                                          adjustHeight(true);
                                          return;
                                    }

                                    adjustHeight();
                              }}
                              onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleSubmit();
                                    }
                              }}
                        />
                       

                        <button onClick={handleSubmit} type="button" disabled={disabled} className={cn("submit-button absolute top-1/2 -translate-y-1/2 right-3", "rounded-xl py-1 px-1", "transition-all duration-200", "disabled:opacity-40 disabled:pointer-events-none", inputValue ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
                              <CornerRightUp className="w-4 h-4" />
                        </button>
                  </div>
            </div>
      );
}
