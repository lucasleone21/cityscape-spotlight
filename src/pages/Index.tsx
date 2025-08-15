import { useEffect, useMemo, useState } from "react";
import MapView, { MapMarker } from "@/components/map/MapView";
import PlaceForm, { PlaceFormData } from "@/components/places/PlaceForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PanelLeftClose, PanelLeftOpen, MapPin, Star, Edit, Trash2, Users } from "lucide-react";

const CREATOR_IMAGES: Record<string, string> = {
  "Danilo Carneiro": "/danilo-carneiro.png",
  "Cadu": "/cadu.png",
  "Mohamad Hindi": "/mohamad-hindi.png",
};

const CITIES: Record<string, { center: [number, number]; zoom: number }> = {
  "São Paulo": { center: [-46.6333, -23.5505], zoom: 11 },
};

const CATEGORIES = ["All", "Japanese", "Brazilian", "Fast Food", "Italian", "Chinese", "Mexican", "Indian", "Mediterranean", "Desserts"] as const;

type Category = typeof CATEGORIES[number];

type Place = {
  id: string;
  name: string;
  city: keyof typeof CITIES;
  category: Exclude<Category, "All">;
  rating: number;
  review: string;
  coordinates: [number, number];
  recommendedBy?: string;
};

const Index = () => {
  const [adminMode, setAdminMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>("São Paulo");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [selectedCreator, setSelectedCreator] = useState<string | "All">("All");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [places, setPlaces] = useState<Place[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [clickCoords, setClickCoords] = useState<[number, number] | undefined>(undefined);
  const [focus, setFocus] = useState<[number, number] | undefined>(undefined);
  const [focusTimestamp, setFocusTimestamp] = useState<number>(0);
  const [editingPlace, setEditingPlace] = useState<Place | undefined>(undefined);



  const handleCreatorClick = (creatorName: string) => {
  // Se o criador clicado já for o selecionado, limpa o filtro (volta para "All")
  // Senão, define o criador clicado como o filtro ativo.
  setSelectedCreator((currentCreator) => 
    currentCreator === creatorName ? "All" : creatorName
    );
  };

  const creators = useMemo(() => {
      const creatorNames = places
        .map(p => p.recommendedBy)
        .filter((name): name is string => !!name);
      return [...new Set(creatorNames)];
  }, [places]);

  const handleMapClick = (lng: number, lat: number) => {
    if (!adminMode) return;
    setClickCoords([lng, lat]);
    setFormOpen(true);
  };

  const handleFocusPlace = (coordinates: [number, number]) => {
    setFocus(coordinates);
    setFocusTimestamp(Date.now()); // Force update even if coordinates are the same
  };

  const handleAddPlace = (data: PlaceFormData) => {
    if (editingPlace) {
      // Update existing place
      const updatedPlace: Place = {
        ...editingPlace,
        name: data.name,
        category: data.category as Exclude<Category, "All">,
        rating: data.rating,
        review: data.review,
        recommendedBy: data.recommendedBy,
      };
      setPlaces((p) => p.map(place => place.id === editingPlace.id ? updatedPlace : place));
      setEditingPlace(undefined);
      // Force focus refresh to update map popup
      if (focus && focus[0] === editingPlace.coordinates[0] && focus[1] === editingPlace.coordinates[1]) {
        setFocusTimestamp(Date.now());
      }
      toast({ title: "Place updated", description: `${data.name} has been updated.` });
    } else {
      // Add new place
      if (!clickCoords) return;
      const newPlace: Place = {
        id: Date.now().toString(),
        name: data.name,
        city: selectedCity,
        category: data.category as Exclude<Category, "All">,
        rating: data.rating,
        review: data.review,
        coordinates: clickCoords,
        recommendedBy: data.recommendedBy,
      };
      setPlaces((p) => [newPlace, ...p]);
      toast({ title: "Place saved", description: `${data.name} added to ${selectedCity}.` });
    }
    setFormOpen(false);
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setFormOpen(true);
  };

  const handleDeletePlace = (placeId: string) => {
    const deletingPlace = places.find(p => p.id === placeId);
    setPlaces((p) => p.filter(place => place.id !== placeId));
    // Clear focus if we're deleting the focused place
    if (deletingPlace && focus && focus[0] === deletingPlace.coordinates[0] && focus[1] === deletingPlace.coordinates[1]) {
      setFocus(undefined);
      setFocusTimestamp(0);
    }
    toast({ title: "Place deleted", description: "Place has been removed." });
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const byCity = p.city === selectedCity;
      const byCategory = selectedCategory === "All" || p.category === selectedCategory;
      const byCreator = selectedCreator === "All" || p.recommendedBy === selectedCreator;
      return byCity && byCategory && byCreator;
    });
  }, [places, selectedCity, selectedCategory, selectedCreator]);

  const markers: MapMarker[] = useMemo(() => {
    return filteredPlaces.map((p) => ({
      id: p.id,
      coordinates: p.coordinates,
      title: p.name,
      rating: p.rating,
      category: p.category,
      review: p.review,
      recommendedBy: p.recommendedBy,
      // Only add callbacks when admin mode is explicitly true
      onEdit: adminMode === true ? () => handleEditPlace(p) : undefined,
      onDelete: adminMode === true ? () => handleDeletePlace(p.id) : undefined,
    }));
  }, [filteredPlaces, adminMode, handleEditPlace, handleDeletePlace]);

  const cityCenter = CITIES[selectedCity]?.center;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="app-header sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              variant="ghost"
              size="sm"
              className="toggle-button"
            >
              {sidebarVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                City Explorer
              </h1>
              <p className="text-xs text-muted-foreground">Curated places worth visiting</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Admin mode</span>
              <Switch checked={adminMode} onCheckedChange={setAdminMode} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <aside className={`sidebar-panel absolute left-0 top-0 z-30 w-80 h-full ${!sidebarVisible ? 'sidebar-panel--hidden' : ''}`}>
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            <Card className="border-0 shadow-none bg-sidebar-background/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-sidebar-foreground">City</label>
                  <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as keyof typeof CITIES)}>
                    <SelectTrigger className="bg-sidebar-background border-sidebar-border">
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
                  <label className="text-sm font-medium text-sidebar-foreground">Category</label>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                    <SelectTrigger className="bg-sidebar-background border-sidebar-border">
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

            <Card className="border-0 shadow-none bg-sidebar-background/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {/* Imagens dos Criadores */}
                      {creators.map((creator) => (
                        <img
                          key={creator}
                          src={CREATOR_IMAGES[creator]}
                          alt={creator}
                          onClick={() => handleCreatorClick(creator)}
                          className={`w-14 h-14 rounded-full object-cover cursor-pointer transition-all border-2 ${
                            selectedCreator === creator
                              ? 'border-primary opacity-100'
                              : 'border-transparent hover:opacity-75'
                          }`}
                          title={creator} // Mostra o nome ao passar o mouse
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

            <Card className="border-0 shadow-none bg-sidebar-background/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" />
                  Places ({filteredPlaces.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {focus && (
                  <div className="mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFocus(undefined);
                        setFocusTimestamp(0);
                      }}
                      className="w-full text-xs"
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Return to City Overview
                    </Button>
                  </div>
                )}
                {filteredPlaces.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No places yet.
                      {adminMode && (
                        <span className="block mt-1 text-xs">Click on the map to add your first one.</span>
                      )}
                    </p>
                  </div>
                )}
                {filteredPlaces.map((p) => (
                  <div
                    key={p.id}
                    className={`place-card ${
                      focus && focus[0] === p.coordinates[0] && focus[1] === p.coordinates[1] 
                        ? 'place-card--focused' 
                        : ''
                    } transition-all duration-200`}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleFocusPlace(p.coordinates)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sidebar-foreground">{p.name}</div>
                      </div>
                      <div className="text-xs text-sidebar-foreground/70 mb-1">
                        {p.category} • {"★".repeat(Math.round(p.rating))} ({p.rating})
                      </div>
                      {p.review && (
                        <div className="text-sm text-sidebar-foreground/80 leading-relaxed">{p.review}</div>
                      )}
                      {focus && focus[0] === p.coordinates[0] && focus[1] === p.coordinates[1] && (
                        <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Map focused here
                        </div>
                      )}
                    </div>
                    {adminMode && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-sidebar-border/30">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPlace(p);
                          }}
                          className="flex-1 h-8 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlace(p.id);
                          }}
                          className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Map Section */}
        <section className={`absolute top-0 right-0 h-full transition-all duration-300 ${
          sidebarVisible ? 'left-80' : 'left-0'
        } ${
          formOpen ? (sidebarVisible ? 'map-container--form-open-shifted' : 'map-container--form-open') : ''
        }`}>
          <div className={`h-full map-container ${!sidebarVisible ? 'map-container--fullscreen' : ''} m-4 ${
            formOpen ? 'pointer-events-none opacity-50' : ''
          }`}>
            <MapView
              center={cityCenter}
              focus={focus}
              focusTimestamp={focusTimestamp}
              markers={markers}
              adminMode={adminMode}
              onMapClick={handleMapClick}
            />
            

          </div>
        </section>
      </main>

      {/* Admin Form - positioned to not cover sidebar */}
      {formOpen && (
        <>
          <div className="admin-form-backdrop" onClick={() => setFormOpen(false)} />
          <div className={`admin-form-overlay ${sidebarVisible ? 'admin-form-overlay--shifted' : ''}`}>
            <PlaceForm
              open={formOpen}
              onOpenChange={(open) => {
                setFormOpen(open);
                if (!open) {
                  setEditingPlace(undefined);
                }
              }}
              coords={clickCoords}
              categories={CATEGORIES.filter((c) => c !== "All") as string[]}
              onSubmit={handleAddPlace}
              variant="sidebar"
              initialData={editingPlace}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
