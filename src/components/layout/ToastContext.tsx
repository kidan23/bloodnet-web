import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

export const ToastContext = createContext<any>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useRef<Toast>(null);
  return (
    <ToastContext.Provider value={toast}>
      <Toast ref={toast} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => useContext(ToastContext);
