// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";

// export type PlaceFormData = {
//   name: string;
//   category: string;
//   rating: number;
//   review: string;
//   recommendedBy?: string;
// };

// interface PlaceFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   coords?: [number, number]; // [lng, lat]
//   categories: string[];
//   onSubmit: (data: PlaceFormData) => void;
//   variant?: "dialog" | "sidebar";
//   initialData?: {
//     name: string;
//     category: string;
//     rating: number;
//     review: string;
//     recommendedBy?: string;
//   };
// }

// const PlaceForm = ({ open, onOpenChange, coords, categories, onSubmit, variant = "dialog", initialData }: PlaceFormProps) => {
//   const [form, setForm] = useState<PlaceFormData>({
//     name: "",
//     category: "",
//     rating: 5,
//     review: "",
//     recommendedBy: "",
//   });

//   // Update form category when categories prop changes or when form opens
//   useEffect(() => {
//     if (categories.length > 0 && (!form.category || form.category === "")) {
//       setForm(prev => ({ ...prev, category: categories[0] }));
//     }
//   }, [categories, form.category]);

//   // Reset form when opening or set initial data for editing
//   useEffect(() => {
//     if (open) {
//       if (initialData) {
//         // Editing mode - populate with existing data
//         setForm({
//           name: initialData.name,
//           category: initialData.category,
//           rating: initialData.rating,
//           review: initialData.review,
//           recommendedBy: initialData.recommendedBy, //|| "",
//         });
//       } else {
//         // Adding mode - reset form
//         setForm({
//           name: "",
//           category: categories[0] || "",
//           rating: 5,
//           review: "",
//           recommendedBy: "",
//         });
//       }
//     }
//   }, [open, categories, initialData]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validate required fields
//     if (!form.name.trim()) {
//       alert("Please enter a place name");
//       return;
//     }
    
//     if (!form.category || form.category === "") {
//       alert("Please select a category");
//       return;
//     }
    
//     if (!form.rating || form.rating < 1 || form.rating > 5) {
//       alert("Please select a valid rating between 1 and 5");
//       return;
//     }

//     if (!form.recommendedBy || form.recommendedBy === "") {
//       alert("Please select a Creator");
//       return;
//     }
    
//     onSubmit(form);
//   };

//   // Sidebar variant renders without Dialog wrapper
//   if (variant === "sidebar") {
//     return (
//       <div className="h-full">
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="text-xl font-semibold">{initialData ? 'Edit place' : 'Add highlighted place'}</h2>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => onOpenChange(false)}
//               className="h-8 w-8 p-0 rounded-full"
//             >
//               ✕
//             </Button>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             Share your review and mark as recommended. Visitors will see these on the map.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {coords && (
//             <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
//               📍 {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
//             </div>
//           )}

//           <div className="grid gap-2">
//             <label className="text-sm font-medium">
//               Name <span className="text-red-500">*</span>
//             </label>
//             <Input
//               value={form.name}
//               onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//               placeholder="Place name"
//               required
//               className={!form.name.trim() ? "border-red-300 focus:border-red-500" : ""}
//             />
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm font-medium">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.category}
//               onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//               required
//               className={`w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
//                 !form.category ? "border-red-300 focus:border-red-500" : "border-input"
//               }`}
//             >
//               <option value="">Select a category</option>
//               {categories.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm font-medium">
//               Rating <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.rating}
//               onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
//               required
//               className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//             >
//               <option value="">Select rating</option>
//               {[1,2,3,4,5].map((n) => (
//                 <option key={n} value={n}>
//                   {n} {"★".repeat(n)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm font-medium">Recomendado por</label>
//             <select
//               value={form.recommendedBy}
//               onChange={(e) => setForm((f) => ({ ...f, recommendedBy: e.target.value }))}
//               className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//             >
//               <option value="">Selecionar...</option>
//               <option value="Danilo Carneiro">Danilo Carneiro</option>
//               <option value="Cadu">Cadu</option>
//               <option value="Mohamad Hindi">Mohamad Hindi</option>
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm font-medium">Review</label>
//             <Textarea
//               value={form.review}
//               onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
//               placeholder="Write a short review..."
//               rows={4}
//             />
//           </div>

//           <div className="flex gap-2 pt-4">
//             <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
//               Cancel
//             </Button>
//             <Button type="submit" className="flex-1">
//               {initialData ? 'Update place' : 'Save place'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     );
//   }

//   // Default dialog variant
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{initialData ? 'Edit place' : 'Add a highlighted place'}</DialogTitle>
//           <DialogDescription>
//             Share your review and mark as recommended. Visitors will see these on the map.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {coords && (
//             <div className="text-xs text-muted-foreground">Coordinates: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>
//           )}

//           <div className="grid gap-2">
//             <label className="text-sm">
//               Name <span className="text-red-500">*</span>
//             </label>
//             <Input
//               value={form.name}
//               onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//               placeholder="Place name"
//               required
//               className={!form.name.trim() ? "border-red-300 focus:border-red-500" : ""}
//             />
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.category}
//               onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//               required
//               className={`w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
//                 !form.category ? "border-red-300 focus:border-red-500" : "border-input"
//               }`}
//             >
//               <option value="">Select a category</option>
//               {categories.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm">
//               Rating <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={form.rating}
//               onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
//               required
//               className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//             >
//               <option value="">Select rating</option>
//               {[1,2,3,4,5].map((n) => (
//                 <option key={n} value={n}>
//                   {n} {"★".repeat(n)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm">Recomendado por</label>
//             <select
//               value={form.recommendedBy}
//               onChange={(e) => setForm((f) => ({ ...f, recommendedBy: e.target.value }))}
//               className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//             >
//               <option value="">Selecionar...</option>
//               <option value="Danilo Carneiro">Danilo Carneiro</option>
//               <option value="Cadu">Cadu</option>
//               <option value="Mohamad Hindi">Mohamad Hindi</option>
//             </select>
//           </div>

//           <div className="grid gap-2">
//             <label className="text-sm">Review</label>
//             <Textarea
//               value={form.review}
//               onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
//               placeholder="Write a short review..."
//               rows={4}
//             />
//           </div>

//           <div className="flex justify-end gap-2 pt-2">
//             <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
//             <Button type="submit">{initialData ? 'Update place' : 'Save place'}</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PlaceForm;


////////////////////////////////

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
import { ImageUp, X } from "lucide-react"; // Importando ícones para o novo campo

// 1. Atualize o tipo de dados do formulário para incluir a imagem
export type PlaceFormData = {
  name: string;
  category: string;
  rating: number;
  review: string;
  recommendedBy?: string;
  image?: string | string; // Pode ser um arquivo (novo) ou uma string de URL (existente)
};

interface PlaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coords?: [number, number]; // [lng, lat]
  categories: string[];
  onSubmit: (data: PlaceFormData) => void;
  variant?: "dialog" | "sidebar";
  initialData?: {
    name: string;
    category: string;
    rating: number;
    review: string;
    recommendedBy?: string;
    image?: string; // A imagem inicial será uma URL
  };
}

const PlaceForm = ({ open, onOpenChange, coords, categories, onSubmit, variant = "dialog", initialData }: PlaceFormProps) => {
  const [form, setForm] = useState<PlaceFormData>({
    name: "",
    category: "",
    rating: 5,
    review: "",
    recommendedBy: "",
    image: undefined, // Adicionado o campo de imagem ao estado inicial
  });

  // 2. Adicione um estado para a pré-visualização da imagem
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && (!form.category || form.category === "")) {
      setForm(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, form.category]);

  // 5. Atualize o useEffect para lidar com a imagem inicial e limpar a pré-visualização
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Modo de edição
        setForm({
          name: initialData.name,
          category: initialData.category,
          rating: initialData.rating,
          review: initialData.review,
          recommendedBy: initialData.recommendedBy || "",
          image: initialData.image, // Mantém a URL da imagem existente
        });
        // Define a pré-visualização se houver uma imagem inicial
        if (initialData.image) {
          setImagePreview(initialData.image);
        } else {
          setImagePreview(null);
        }
      } else {
        // Modo de adição - reseta tudo
        setForm({
          name: "",
          category: categories[0] || "",
          rating: 5,
          review: "",
          recommendedBy: "",
          image: undefined,
        });
        setImagePreview(null); // Limpa a pré-visualização
      }
    }
  }, [open, categories, initialData]);


  // 3. Crie uma função para lidar com a mudança do arquivo de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Remova a linha que salvava o 'file' object daqui.
      // setForm((f) => ({ ...f, image: file })); // << LINHA REMOVIDA

      const reader = new FileReader();

      // A mágica acontece aqui, quando o arquivo termina de ser lido
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;

        // Agora, atualize AMBOS os estados com a string da URL
        setImagePreview(imageDataUrl);
        setForm((f) => ({ ...f, image: imageDataUrl }));
      };

      // Inicia a leitura do arquivo para convertê-lo em uma Data URL
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category || form.rating < 1 || form.rating > 5 || !form.recommendedBy) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit(form);
  };

  // Conteúdo do formulário reutilizável
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {coords && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          📍 {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
        </div>
      )}

      {/* Nome */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Place name"
          required
        />
      </div>

      {/* Categoria */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          required
          className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Rating */}
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
            <option key={n} value={n}>{n} {"★".repeat(n)}</option>
          ))}
        </select>
      </div>
      
      {/* Recomendado por */}
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

      {/* Review */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Review</label>
        <Textarea
          value={form.review}
          onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
          placeholder="Write a short review..."
          rows={4}
        />
      </div>

      {/* 4. Adicione o campo de anexo de imagem */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Attachment</label>
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Selected preview" className="w-full h-40 object-cover rounded-md border" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={() => {
                setForm(f => ({ ...f, image: undefined }));
                setImagePreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageUp className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
                <Input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div> 
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Update place' : 'Save place'}
        </Button>
      </div>
    </form>
  );

  if (variant === "sidebar") {
    return (
      <div className="h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{initialData ? 'Edit place' : 'Add highlighted place'}</h2>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0 rounded-full">
              ✕
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your review and mark as recommended. Visitors will see these on the map.
          </p>
        </div>
        {formContent}
      </div>
    );
  }

  // Variante de diálogo padrão
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit place' : 'Add a highlighted place'}</DialogTitle>
          <DialogDescription>
            Share your review and mark as recommended. Visitors will see these on the map.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default PlaceForm;