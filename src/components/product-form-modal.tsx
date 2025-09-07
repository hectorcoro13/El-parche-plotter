"use client";

import { useState, useEffect, FormEvent, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

type Product = {
  id?: string; name: string; description: string; price: number | string; stock: number | string;
  categoryId: string; imgUrl?: string; category?: { id: string; name: string };
};
type Category = { id: string; name: string };
type ProductFormModalProps = {
  isOpen: boolean; onClose: () => void; onSave: () => void; productToEdit?: Product | null;
};

export function ProductFormModal({ isOpen, onClose, onSave, productToEdit }: ProductFormModalProps) {
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, stock: 0, categoryId: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!response.ok) throw new Error('Error al cargar categorías');
        const data = await response.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (error) { console.error(error); }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      const { category, ...productData } = productToEdit;
      const productDataForForm = { ...productData, price: Number(productData.price), stock: Number(productData.stock), };
      setFormData(productDataForForm);
      setImagePreview(productToEdit.imgUrl || null);
    } else {
      setFormData({ name: '', description: '', price: 0, stock: 0, categoryId: '' });
      setImagePreview(null);
    }
    setSelectedFile(null);
  }, [productToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/uploadImage/${productId}`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
    });
    if (!response.ok) throw new Error('La imagen no pudo ser subida. El producto se guardó sin la nueva imagen.');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = productToEdit ? `${process.env.NEXT_PUBLIC_API_URL}/products/${productToEdit.id}` : `${process.env.NEXT_PUBLIC_API_URL}/products`;
    const method = productToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${productToEdit ? 'actualizar' : 'crear'} el producto.`);
      }
      
      const savedProduct = await response.json();
      const productId = savedProduct.id;

      if (selectedFile && productId) await uploadImage(productId, selectedFile);
      
      onClose();
      
      setTimeout(() => {
        Swal.fire({
          title: '¡Éxito!',
          text: `Producto ${productToEdit ? 'actualizado' : 'creado'} correctamente.`,
          icon: 'success', timer: 1500, showConfirmButton: false, background: '#111827', color: '#FFFFFF'
        });
        onSave();
      }, 300);

    } catch (err: any) {
      // --- CAMBIO APLICADO AQUÍ ---
      const Toast = Swal.mixin({
        toast: true, position: "top-end", showConfirmButton: false, timer: 3000,
        timerProgressBar: true, background: '#111827', color: '#FFFFFF', iconColor: '#ef4444'
      });
      Toast.fire({ icon: "error", title: err.message });
      
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-white bg-gray-900 border-red-500/20 max-w-2xl">
        <DialogHeader><DialogTitle className="font-serif">{productToEdit ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-black/20 rounded-lg">
            <div className="w-48 h-48 relative border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center">
              {imagePreview ? (
                <Image src={imagePreview} alt="Vista previa" layout="fill" objectFit="cover" className="rounded-md" />
              ) : (
                <div className="text-center text-gray-500"><UploadCloud className="w-10 h-10 mx-auto" /><p>Imagen</p></div>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}
                className="bg-transparent border-white text-white hover:bg-red-600 hover:border-red-600 hover:text-white">
              Seleccionar Imagen
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div className="space-y-4">
            <div><label htmlFor="name" className="text-sm text-gray-400">Nombre</label><input id="name" name="name" value={formData.name} onChange={handleChange} className={inputStyles} required /></div>
            <div><label htmlFor="description" className="text-sm text-gray-400">Descripción</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} className={inputStyles} required rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label htmlFor="price" className="text-sm text-gray-400">Precio</label><input id="price" type="number" name="price" value={formData.price} onChange={handleChange} className={inputStyles} required /></div>
              <div><label htmlFor="stock" className="text-sm text-gray-400">Stock</label><input id="stock" type="number" name="stock" value={formData.stock} onChange={handleChange} className={inputStyles} required /></div>
            </div>
            <div>
              <label htmlFor="categoryId" className="text-sm text-gray-400">Categoría</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={inputStyles} required>
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">{isLoading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}