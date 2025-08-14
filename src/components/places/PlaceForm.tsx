import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type PlaceFormData = {
  name: string;
  category: string;
  rating: number;
  review: string;
  recommendedBy?: string;
};

interface PlaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coords?: [number, number]; // [lng, lat]
  categories: string[];
  onSubmit: (data: PlaceFormData) => void;
  variant?: "dialog" | "sidebar";
}

const PlaceForm = ({ open, onOpenChange, coords, categories, onSubmit, variant = "dialog" }: PlaceFormProps) => {
  const [form, setForm] = useState<PlaceFormData>({
    name: "",
    category: "",
    rating: 5,
    review: "",
    recommendedBy: "",
  });

  // Update form category when categories prop changes or when form opens
  useEffect(() => {
    if (categories.length > 0 && (!form.category || form.category === "")) {
      setForm(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, form.category]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        category: categories[0] || "",
        rating: 5,
        review: "",
        recommendedBy: "",
      });
    }
  }, [open, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name.trim()) {
      alert("Please enter a place name");
      return;
    }
    
    if (!form.category || form.category === "") {
      alert("Please select a category");
      return;
    }
    
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      alert("Please select a valid rating between 1 and 5");
      return;
    }
    
    onSubmit(form);
  };

  // Sidebar variant renders without Dialog wrapper
  if (variant === "sidebar") {
    return (
      <div className="h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Add highlighted place</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-full"
            >
              ✕
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your review and mark as recommended. Visitors will see these on the map.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {coords && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              📍 {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Place name"
              required
              className={!form.name.trim() ? "border-red-300 focus:border-red-500" : ""}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
              className={`w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                !form.category ? "border-red-300 focus:border-red-500" : "border-input"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              required
              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select rating</option>
              {[1,2,3,4,5].map((n) => (
                <option key={n} value={n}>
                  {n} {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Recomendado por</label>
            <select
              value={form.recommendedBy}
              onChange={(e) => setForm((f) => ({ ...f, recommendedBy: e.target.value }))}
              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Selecionar...</option>
              <option value="Danilo Carneiro">Danilo Carneiro</option>
              <option value="Cadu">Cadu</option>
              <option value="Mohamad Hindi">Mohamad Hindi</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Review</label>
            <Textarea
              value={form.review}
              onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
              placeholder="Write a short review..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save place
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Default dialog variant
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
            <label className="text-sm">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Place name"
              required
              className={!form.name.trim() ? "border-red-300 focus:border-red-500" : ""}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
              className={`w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                !form.category ? "border-red-300 focus:border-red-500" : "border-input"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              required
              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select rating</option>
              {[1,2,3,4,5].map((n) => (
                <option key={n} value={n}>
                  {n} {"★".repeat(n)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm">Recomendado por</label>
            <select
              value={form.recommendedBy}
              onChange={(e) => setForm((f) => ({ ...f, recommendedBy: e.target.value }))}
              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Selecionar...</option>
              <option value="Danilo Carneiro">Danilo Carneiro</option>
              <option value="Cadu">Cadu</option>
              <option value="Mohamad Hindi">Mohamad Hindi</option>
            </select>
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
