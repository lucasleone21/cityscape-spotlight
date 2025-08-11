import { useEffect, useMemo, useState } from "react";
import MapView, { MapMarker } from "@/components/map/MapView";
import PlaceForm, { PlaceFormData } from "@/components/places/PlaceForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const CITIES: Record<string, { center: [number, number]; zoom: number }> = {
  "São Paulo": { center: [-46.6333, -23.5505], zoom: 11 },
  "New York": { center: [-74.0060, 40.7128], zoom: 11 },
  Bali: { center: [115.1889, -8.4095], zoom: 10 },
  London: { center: [-0.1276, 51.5072], zoom: 11 },
};

const CATEGORIES = ["All", "Restaurants", "Tourist Attractions", "Hotels"] as const;

type Category = typeof CATEGORIES[number];

type Place = {
  id: string;
  name: string;
  city: keyof typeof CITIES;
  category: Exclude<Category, "All">;
  rating: number;
  review: string;
  coordinates: [number, number];
  recommended: boolean;
};

const Index = () => {
  // Mapbox token (temporary input until Supabase secrets are used)
  const [mapboxToken, setMapboxToken] = useState<string>("");
  useEffect(() => {
    const saved = localStorage.getItem("mapboxToken");
    if (saved) setMapboxToken(saved);
  }, []);
  useEffect(() => {
    if (mapboxToken) localStorage.setItem("mapboxToken", mapboxToken);
  }, [mapboxToken]);

  const [adminMode, setAdminMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>("New York");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const [places, setPlaces] = useState<Place[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [clickCoords, setClickCoords] = useState<[number, number] | undefined>(undefined);
  const [focus, setFocus] = useState<[number, number] | undefined>(undefined);

  const handleMapClick = (lng: number, lat: number) => {
    if (!adminMode) return;
    setClickCoords([lng, lat]);
    setFormOpen(true);
  };

  const handleAddPlace = (data: PlaceFormData) => {
    if (!clickCoords) return;
    const newPlace: Place = {
      id: Date.now().toString(),
      name: data.name,
      city: selectedCity,
      category: data.category as Exclude<Category, "All">,
      rating: data.rating,
      review: data.review,
      coordinates: clickCoords,
      recommended: data.recommended,
    };
    setPlaces((p) => [newPlace, ...p]);
    setFormOpen(false);
    toast({ title: "Place saved", description: `${data.name} added to ${selectedCity}.` });
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const byCity = p.city === selectedCity;
      const byCategory = selectedCategory === "All" || p.category === selectedCategory;
      return byCity && byCategory;
    });
  }, [places, selectedCity, selectedCategory]);

  const markers: MapMarker[] = filteredPlaces.map((p) => ({
    id: p.id,
    coordinates: p.coordinates,
    title: p.name,
    rating: p.rating,
    recommended: p.recommended,
    category: p.category,
  }));

  const cityCenter = CITIES[selectedCity]?.center;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">City Explorer – Curated Map</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Admin mode</span>
            <Switch checked={adminMode} onCheckedChange={setAdminMode} />
          </div>
        </div>
      </header>

      <main className="container py-4 grid gap-4 md:grid-cols-[320px_1fr]">
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm">Mapbox public token</label>
                <Input
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ..."
                />
                <p className="text-xs text-muted-foreground">Temporary input. We can secure this via Supabase secrets next.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm">City</label>
                <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as keyof typeof CITIES)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CITIES).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm">Category</label>
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="h-4" />

          <Card>
            <CardHeader>
              <CardTitle>Highlighted places ({filteredPlaces.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPlaces.length === 0 && (
                <p className="text-sm text-muted-foreground">No places yet. {adminMode ? "Click on the map to add your first one." : ""}</p>
              )}
              {filteredPlaces.map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left rounded-md border p-3 hover:bg-muted/50 transition"
                  onClick={() => setFocus(p.coordinates)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    {p.recommended && <span className="text-xs text-primary">Recommended</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.category} • {"★".repeat(Math.round(p.rating))}</div>
                  {p.review && <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.review}</div>}
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="min-h-[60vh] md:min-h-[75vh]">
          <div className="h-[70vh] md:h-[78vh] rounded-lg border overflow-hidden">
            <MapView
              accessToken={mapboxToken}
              center={cityCenter}
              focus={focus}
              markers={markers}
              adminMode={adminMode}
              onMapClick={handleMapClick}
            />
          </div>
        </section>
      </main>

      <PlaceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        coords={clickCoords}
        categories={CATEGORIES.filter((c) => c !== "All") as string[]}
        onSubmit={handleAddPlace}
      />
    </div>
  );
};

export default Index;
