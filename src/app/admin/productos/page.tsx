"use client";

import { AdminLayout } from "../../../components/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from 'next/image';
import { ProductFormModal } from "../../../components/product-form-modal"; // Importa el nuevo modal
import Swal from 'sweetalert2';
import { useAuthStore } from "../../../store/useAuthStore";

type Product = {
  id: string; // El ID es string (UUID)
  imgUrl: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: { id: string; name: string };
};

function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const { token } = useAuthStore();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      if (!response.ok) throw new Error('No se pudieron cargar los productos.');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#4B5563',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Error al eliminar el producto.');
          Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
          fetchProducts(); // Refresca la lista
        } catch (err: any) {
          Swal.fire('Error', err.message, 'error');
        }
      }
    });
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(price);

  return (
    <>
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchProducts}
        productToEdit={productToEdit ? { ...productToEdit, categoryId: productToEdit.category.id } : null}
      />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-serif">Gestionar Productos</h1>
          <Button onClick={handleAddProduct} className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="w-5 h-5 mr-2" />
            Añadir Producto
          </Button>
        </div>
        <div className="bg-black p-4 rounded-lg border border-red-500/20">
          {isLoading ? <p>Cargando productos...</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="p-4">Imagen</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-2"><Image src={product.imgUrl || '/placeholder.svg'} alt={product.name} width={50} height={50} className="rounded-md object-cover"/></td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4 font-mono">{formatPrice(product.price)}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4 space-x-4">
                        <button onClick={() => handleEditProduct(product)} className="text-sky-400 hover:text-sky-300">Editar</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <ProductsManager />
    </AdminLayout>
  );
}