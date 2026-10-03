import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { ScrollArea } from "./scroll-area";

export function FormDialog({
  children,
  open,
  setOpen,
  title,
  description = "",
  className = "",
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-150px)]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
