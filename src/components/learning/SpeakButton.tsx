import { Volume2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSpeech } from "./use-speech";

interface SpeakButtonProps extends Omit<ButtonProps, "onClick"> {
  /** chữ Hán cần đọc (không truyền pinyin) */
  text: string;
  label?: string;
}

export function SpeakButton({ text, label, className, size = "icon", variant = "ghost", ...props }: SpeakButtonProps) {
  const { say, speaking, available } = useSpeech();
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      aria-label={label ?? `Nghe “${text}”`}
      onClick={(e) => {
        // nằm trong Link/thẻ bấm được → không kích hoạt phần tử cha
        e.preventDefault();
        e.stopPropagation();
        if (available === false) {
          toast.error("Máy chưa có giọng đọc tiếng Trung", { description: "Xem hướng dẫn cài giọng trong Cài đặt." });
          return;
        }
        void say(text);
      }}
      className={cn(speaking && "text-primary", className)}
      {...props}
    >
      <Volume2 className={cn(speaking && "animate-pulse")} />
      {size !== "icon" && (label ?? "Nghe")}
    </Button>
  );
}
