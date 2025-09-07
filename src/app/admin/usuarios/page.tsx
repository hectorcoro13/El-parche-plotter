"use client";

import { AdminLayout } from "../../../components/AdminLayout";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import Swal from 'sweetalert2';

type User = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  isBlocked: boolean; // <-- Añadimos la propiedad de bloqueo
};

function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user: adminUser } = useAuthStore(); // Obtenemos el admin actual

  const fetchUsers = async () => { // Separamos la función para poder re-llamarla
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudieron cargar los usuarios.');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // --- NUEVA FUNCIÓN PARA MANEJAR EL BLOQUEO ---
  const handleBlockToggle = (userToBlock: User) => {
    if (userToBlock.id === adminUser?.id) {
      Swal.fire('Acción no permitida', 'No puedes bloquearte a ti mismo.', 'info');
      return;
    }
    if (userToBlock.isAdmin) {
      Swal.fire('Acción no permitida', 'No puedes bloquear a otro administrador.', 'warning');
      return;
    }

    const actionText = userToBlock.isBlocked ? 'desbloquear' : 'bloquear';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `Esta acción va a ${actionText} a ${userToBlock.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#4B5563',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/block/${userToBlock.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error(`No se pudo ${actionText} al usuario.`);
          
          Swal.fire('¡Éxito!', `El usuario ha sido ${actionText === 'bloquear' ? 'bloqueado' : 'desbloqueado'}.`, 'success');
          fetchUsers(); // Recargamos la lista para ver el cambio
        } catch (err: any) {
          Swal.fire('Error', err.message, 'error');
        }
      }
    });
  };
  
  if (isLoading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-6">Gestionar Usuarios</h1>
      <div className="bg-black p-4 rounded-lg border border-red-500/20">
         <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            {/* ... thead ... */}
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isAdmin ? 'text-red-200 bg-red-800/50' : 'text-sky-200 bg-sky-800/50'}`}>
                      {user.isAdmin ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="p-4">
                    {/* --- BOTÓN CON LÓGICA DE BLOQUEO --- */}
                    <button
                      onClick={() => handleBlockToggle(user)}
                      disabled={user.isAdmin || user.id === adminUser?.id}
                      className={`font-bold ${user.isBlocked ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UsersManager />
    </AdminLayout>
  );
}