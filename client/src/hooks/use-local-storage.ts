import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Estado para almacenar nuestro valor
  // Pasa la función de estado inicial a useState para que la lógica se ejecute solo una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Obtener del localStorage por key
      const item = window.localStorage.getItem(key);
      // Parsear JSON almacenado o retornar initialValue si no existe
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay error, retornar initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Retornar una versión envuelta de la función setter de useState que persiste
  // el nuevo valor en localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que value sea una función para que tengamos la misma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Guardar estado
      setStoredValue(valueToStore);
      // Guardar en localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Una implementación más avanzada manejaría el caso de error
      console.error(error);
    }
  };

  // Escuchar cambios en otros contextos/pestañas para mantener sincronización
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    // Agregar listener para el evento storage
    window.addEventListener('storage', handleStorageChange);
    
    // Limpiar listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}