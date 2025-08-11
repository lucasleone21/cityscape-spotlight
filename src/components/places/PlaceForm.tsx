import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type PlaceFormData = {
  name: string;
  category: string;
  rating: number;
  review: string;
  recommended: boolean;
};

interface PlaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coords?: [number, number]; // [lng, lat]
  categories: string[];
  onSubmit: (data: PlaceFormData) => void;
}

const PlaceForm = ({ open, onOpenChange, coords, categories, onSubmit }: PlaceFormProps) => {
  const [form, setForm] = useState<PlaceFormData>({
    name: "",
    category: categories[0] ?? "Restaurants",
    rating: 5,
    review: "",
    recommended: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a highlighted place</DialogTitle>
          <DialogDescription>
            Share your review and mark as recommended. Visitors will see these on the map.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {coords && (
            <div className="text-xs text-muted-foreground">Coordinates: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>
          )}

          <div className="grid gap-2">
            <label className="text-sm">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Place name"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Category</label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Rating</label>
            <Select
              value={String(form.rating)}
              onValueChange={(v) => setForm((f) => ({ ...f, rating: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} {"★".repeat(n)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Review</label>
            <Textarea
              value={form.review}
              onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
              placeholder="Write a short review..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Mark as recommended</div>
              <div className="text-xs text-muted-foreground">Recommended places appear highlighted on the map.</div>
            </div>
            <Switch
              checked={form.recommended}
              onCheckedChange={(v) => setForm((f) => ({ ...f, recommended: v }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save place</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceForm;
