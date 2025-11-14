'use client';

import { useState, useEffect } from 'react';

export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Verifica se o modal já foi visto
    const hasSeenModal = localStorage.getItem('cherut-welcome-modal-seen');

    if (!hasSeenModal) {
      // Pequeno delay para melhor experiência do usuário
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const resetModal = () => {
    localStorage.removeItem('cherut-welcome-modal-seen');
    setIsOpen(true);
  };

  // Durante o SSR e primeira renderização, não mostra o modal
  if (!mounted) {
    return {
      isOpen: false,
      openModal,
      closeModal,
      resetModal,
      mounted: false,
    };
  }

  return {
    isOpen,
    openModal,
    closeModal,
    resetModal,
    mounted: true,
  };
}