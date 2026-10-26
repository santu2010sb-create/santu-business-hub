import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type Row = { id: string; published: boolean };

/** Shared list UI for orderable, publishable items (services, FAQs). */
export function OrderedRows<T extends Row>({
  rows,
  render,
  onMove,
  onTogglePublished,
  onEdit,
  onDelete,
  itemName,
  busy,
}: {
  rows: T[];
  render: (row: T) => ReactNode;
  onMove: (index: number, dir: -1 | 1) => void;
  onTogglePublished: (row: T, published: boolean) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  itemName: string;
  busy: boolean;
}) {
  return (
    <ul className="grid gap-3">
      {rows.map((row, i) => (
        <li key={row.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
          <div className="flex shrink-0 gap-1 sm:flex-col">
            <Button variant="ghost" size="icon" aria-label="Move up" disabled={busy || i === 0} onClick={() => onMove(i, -1)}>
              <ArrowUp />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Move down" disabled={busy || i === rows.length - 1} onClick={() => onMove(i, 1)}>
              <ArrowDown />
            </Button>
          </div>
          <div className="min-w-0 flex-1">{render(row)}</div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={row.published} disabled={busy} onCheckedChange={(v) => onTogglePublished(row, v)} />
              {row.published ? "Published" : "Hidden"}
            </label>
            <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
              <Pencil /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this {itemName}?</AlertDialogTitle>
                  <AlertDialogDescription>This removes it permanently. To hide it temporarily, switch it to Hidden instead.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(row)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function moveIds<T extends { id: string }>(rows: T[], index: number, dir: -1 | 1): string[] {
  const ids = rows.map((r) => r.id);
  const j = index + dir;
  if (j < 0 || j >= ids.length) return ids;
  [ids[index], ids[j]] = [ids[j], ids[index]];
  return ids;
}
