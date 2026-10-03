"use client";

import { Drawer } from "vaul";
import { ScrollArea } from "./scroll-area";
import { Button } from "./button";
import { X } from "lucide-react";

export default function VaulDrawer({
  open,
  setOpen,
  title,
  children,
  description = "",
}) {
  return (
    <Drawer.Root direction="right" open={open} setOpen={setOpen}>
      <Drawer.Trigger className="sr-only">Open Drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50 bg-black/70"
          // onClick={() => setOpen(!open)}
        />
        <Drawer.Content
          className="fixed top-2 right-2 bottom-2 z-50 flex w-[50%] outline-none"
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={{ "--initial-transform": "calc(100% + 8px)" }}
        >
          <Button
            className={"absolute top-2 left-2"}
            type="button"
            size={"icon"}
            variant={"ghost"}
            onClick={() => setOpen(!open)}
          >
            <X />
          </Button>
          <div className="bg-sidebar flex h-full w-full grow flex-col rounded-2xl p-5 pt-12">
            <ScrollArea className="h-full pr-4">
              <div className="">
                <Drawer.Title className="text-popover-foreground mb-2 font-medium">
                  {title}
                </Drawer.Title>
                <Drawer.Description className="text-muted-foreground mb-2">
                  {description}
                </Drawer.Description>
                <div>{children}</div>
              </div>
            </ScrollArea>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
