"use client"

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Camera, Save } from "lucide-react";
import Swal from "sweetalert2";
import { AuthModal } from "../../components/auth-modal";
import { useUIStore } from "../../store/useUIStore";
import { ImageCropper } from "../../components/image-cropper";
import { useAuthStore } from "../../store/useAuthStore";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | number | null; 
  address?: string | null;      
  city?: string | null;        
  imageProfile?: string | null; 
  order?: any[];
  identificationType?: string | null;
  identificationNumber?: string | null;
};

export default function ProfilePage() {
  const { user, isLoggedIn, updateUserProfile } = useAuthStore();
  const [editData, setEditData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setEditData(user);
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (user && !isEditing) {
      setEditData(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!user || !editData) return;
    const token = useAuthStore.getState().token;
    try {
      const bodyToUpdate = {
        name: editData.name,
        phone: Number(editData.phone),
        address: editData.address,
        city: editData.city,
        identificationType: editData.identificationType,
        identificationNumber: editData.identificationNumber,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyToUpdate),
      });

      if (!response.ok) throw new Error("Error al guardar los cambios.");
      const updatedUser = await response.json();
      updateUserProfile(updatedUser);
      setIsEditing(false);
      Swal.fire({ title: '¡Guardado!', text: 'Tu perfil ha sido actualizado.', icon: 'success', background: '#111827', color: '#FFFFFF', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#111827', color: '#FFFFFF' });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const uploadCroppedImage = async (croppedImageBlob: Blob) => {
    if (user) {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append('file', croppedImageBlob, 'profile.jpg'); 
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/UploadProfile/${user.id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error("Error al subir la imagen.");
        const updatedUser = await response.json();
        updateUserProfile(updatedUser);
        Swal.fire({ title: '¡Foto Actualizada!', icon: 'success', background: '#111827', color: '#FFFFFF', timer: 1500, showConfirmButton: false });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#111827', color: '#FFFFFF' });
      }
    }
  };
  
  const inputStyles = "w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";
  const labelStyles = "text-sm text-gray-400 mb-1"; 

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto py-20 px-4 text-center"></main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <ImageCropper 
        imageSrc={imageToCrop}
        onCropComplete={uploadCroppedImage}
        onClose={() => setImageToCrop(null)}
      />
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto py-20 px-4">
          <div className="relative mb-12">
            <h1 className="text-5xl font-bold font-serif text-center">Mi Perfil</h1>
            {user && (
              <Button onClick={isEditing ? handleSaveChanges : handleEditToggle} className="absolute top-0 right-0 bg-red-600 hover:bg-red-700">
                {isEditing ? <><Save className="w-4 h-4 mr-2"/>Guardar</> : "Editar Perfil"}
              </Button>
            )}
          </div>
          
          {!isLoggedIn && hasMounted ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">Acceso Requerido</h2>
              <p className="text-gray-400 mb-6">Debes iniciar sesión para ver tu perfil.</p>
              <Button onClick={openAuthModal} className="bg-red-600 hover:bg-red-700">
                Iniciar Sesión / Registro
              </Button>
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-40 h-40">
                    <Image 
                      src={user.imageProfile && user.imageProfile !== 'No image' ? user.imageProfile : "/placeholder-user.jpg"} 
                      alt="Foto de perfil" 
                      width={160} height={160}
                      style={{ objectFit: 'cover' }}
                      className="rounded-full border-2 border-red-500/50"
                      key={user.imageProfile}
                    />
                    {isEditing && (
                      <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-red-600 p-2 rounded-full z-10 ...">
                        <Camera className="w-5 h-5" />
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>
                <div className="md:col-span-2 bg-gray-900/50 p-8 rounded-lg ...">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className={labelStyles}>Nombre Completo</h2>
                        {isEditing ? <input name="name" onChange={handleInputChange} value={editData.name || ''} className={inputStyles} /> : <p className="text-xl">{user.name}</p>}
                      </div>
                      <div>
                        <h2 className={labelStyles}>Email</h2>
                        <p className="text-xl text-gray-400">{user.email}</p>
                      </div>
                       <div>
                        <h2 className={labelStyles}>Teléfono</h2>
                        {isEditing ? <input name="phone" onChange={handleInputChange} value={editData.phone || ''} className={inputStyles} /> : <p className="text-xl">{user.phone || 'No especificado'}</p>}
                      </div>
                    </div>
                    <div className="space-y-6">
                       <div>
                        <h2 className={labelStyles}>Dirección</h2>
                        {isEditing ? <input name="address" onChange={handleInputChange} value={editData.address || ''} className={inputStyles} /> : <p className="text-xl">{user.address || 'No especificada'}</p>}
                      </div>
                      <div>
                        <h2 className={labelStyles}>Ciudad</h2>
                        {isEditing ? <input name="city" onChange={handleInputChange} value={editData.city || ''} className={inputStyles} /> : <p className="text-xl">{user.city || 'No especificada'}</p>}
                      </div>
                       <div>
                        <h2 className={labelStyles}>Tipo de Documento</h2>
                        {isEditing ? (
                          <select name="identificationType" onChange={handleInputChange} value={editData.identificationType || 'CC'} className={inputStyles}>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="NIT">NIT</option>
                            <option value="PASSPORT">Pasaporte</option>
                          </select>
                        ) : <p className="text-xl">{user.identificationType || 'No especificado'}</p>}
                      </div>
                      <div>
                        <h2 className={labelStyles}>Número de Documento</h2>
                        {isEditing ? <input name="identificationNumber" onChange={handleInputChange} value={editData.identificationNumber || ''} className={inputStyles} placeholder="Ej: 123456789"/> : <p className="text-xl">{user.identificationNumber || 'No especificado'}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 border-t ...">
                      <h2 className="text-2xl ...">Mis Órdenes</h2>
                      {/* --- CORRECCIÓN APLICADA AQUÍ --- */}
                      {(user.order?.length ?? 0) > 0 ? ( 
                        <p>Aquí se mostrará el historial de órdenes.</p>
                      ) : ( 
                        <p>Aún no has realizado ninguna compra.</p>
                      )}
                  </div>
                </div>
            </div>
          ) : (
             <p className="text-center">Cargando perfil...</p>
          )}
        </main>
        <Footer />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}