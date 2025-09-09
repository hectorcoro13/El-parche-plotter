"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "./ui/button";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";
import { GoogleAuthButton } from "./google-auth-button"; // Importa el nuevo botón

interface Department {
  id: number;
  departamento: string;
  ciudades: string[];
}

export function SignUpForm() {
  const login = useAuthStore((state) => state.login);
  const closeAuthModal = useUIStore((state) => state.closeAuthModal);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    address: "",
    phone: "",
    country: "Colombia",
    city: "",
    identificationType: "CC",
    identificationNumber: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    department: "",
    city: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsDataLoading(true);
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json",
        );
        if (!response.ok)
          throw new Error("No se pudieron cargar los datos de ubicación.");
        const data: Department[] = await response.json();
        setDepartments(
          data.sort((a, b) => a.departamento.localeCompare(b.departamento)),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const departmentData = departments.find(
        (dep) => dep.departamento === selectedDepartment,
      );
      setCities(departmentData?.ciudades.sort() || []);
      setFormData((prev) => ({ ...prev, city: "" }));
    } else {
      setCities([]);
    }
  }, [selectedDepartment, departments]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    if (errors.department) {
      setErrors((prev) => ({ ...prev, department: "" }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      phone: "",
      department: "",
      city: "",
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "El formato del correo no es válido.";
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Debe incluir mayúscula, minúscula, número y un caracter especial (!@#$%^&*)";
      isValid = false;
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Las contraseñas no coinciden.";
      isValid = false;
    }
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "El teléfono solo debe contener números.";
      isValid = false;
    }
    if (!selectedDepartment) {
      newErrors.department = "Debes seleccionar un departamento.";
      isValid = false;
    }
    if (!formData.city) {
      newErrors.city = "Debes seleccionar una ciudad.";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, phone: Number(formData.phone) }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message,
        );
      }

      await login(data.token);

      closeAuthModal();

      await Swal.fire({
        title: "¡Registro Exitoso!",
        text: "Tu cuenta ha sido creada.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#111827",
        color: "#FFFFFF",
      });
      window.location.href = "/";
    } catch (err: any) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
        background: "#111827",
        color: "#FFFFFF",
        iconColor: "#ef4444",
      });

      Toast.fire({
        icon: "error",
        title: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles =
    "w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50";
  const errorTextStyles = "text-red-500 text-xs mt-1";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={inputStyles}
            required
          />
          {errors.email && <p className={errorTextStyles}>{errors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className={inputStyles}
            required
          />
          {errors.password && (
            <p className={errorTextStyles}>{errors.password}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            name="passwordConfirm"
            placeholder="Confirmar Contraseña"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className={inputStyles}
            required
          />
          {errors.passwordConfirm && (
            <p className={errorTextStyles}>{errors.passwordConfirm}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            className={inputStyles}
            required
          />
          {errors.phone && <p className={errorTextStyles}>{errors.phone}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="identificationType" className="text-xs text-gray-400">Tipo Doc.</label>
            <select
              name="identificationType"
              id="identificationType"
              value={formData.identificationType}
              onChange={handleChange}
              className={inputStyles}
            >
              <option value="CC">C.C.</option>
              <option value="CE">C.E.</option>
              <option value="NIT">NIT</option>
              <option value="PASSPORT">Pasaporte</option>
            </select>
          </div>
          <div>
            <label htmlFor="identificationNumber" className="text-xs text-gray-400"># Documento</label>
            <input
              type="text"
              name="identificationNumber"
              id="identificationNumber"
              placeholder="Número de documento"
              value={formData.identificationNumber}
              onChange={handleChange}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className={inputStyles}
              disabled={isDataLoading}
            >
              <option value="">
                {isDataLoading ? "Cargando..." : "Departamento"}
              </option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.departamento}>
                  {dep.departamento}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className={errorTextStyles}>{errors.department}</p>
            )}
          </div>
          <div>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputStyles}
              disabled={!selectedDepartment}
            >
              <option value="">Ciudad</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && <p className={errorTextStyles}>{errors.city}</p>}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={isLoading || isDataLoading}
        >
          {isLoading ? "Registrando..." : "Crear Cuenta"}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-400">
            O continúa con
          </span>
        </div>
      </div>
      <GoogleAuthButton text="Registrarse con Google" />
    </>
  );
}