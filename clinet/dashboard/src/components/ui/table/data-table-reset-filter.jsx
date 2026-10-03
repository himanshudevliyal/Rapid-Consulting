"use client";
import { Button } from "../button";

export function DataTableResetFilter({ isFilterActive, onReset }) {
  return (
    <>
      {isFilterActive ? (
        <Button variant="destructive" size={"sm"} onClick={onReset}>
          Reset Filters
        </Button>
      ) : null}
    </>
  );
}
