import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";

export function EmptyState({ title, children, action, mood = "happy" }: { title: string; children?: ReactNode; action?: ReactNode; mood?: "happy" | "sleepy" }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center md:p-10">
        <Mascot mood={mood} className="size-24" />
        <h2 className="text-lg font-black">{title}</h2>
        {children && <div className="max-w-md font-semibold text-muted-foreground">{children}</div>}
        {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
      </CardContent>
    </Card>
  );
}
