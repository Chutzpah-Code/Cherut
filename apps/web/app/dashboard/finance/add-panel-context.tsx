'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type AddEntityType = 'transaction' | 'account' | 'card' | 'bill' | 'budget' | 'investment';

interface AddPanelState {
  open: boolean;
  type: AddEntityType;
  mode: 'create' | 'edit';
  entity?: any;
  prefill?: any;
}

interface AddPanelContextValue {
  state: AddPanelState;
  openCreate: (type: AddEntityType, prefill?: any) => void;
  openEdit: (type: AddEntityType, entity: any) => void;
  close: () => void;
}

const AddPanelContext = createContext<AddPanelContextValue | null>(null);

const DEFAULT_STATE: AddPanelState = { open: false, type: 'transaction', mode: 'create' };

export function AddPanelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AddPanelState>(DEFAULT_STATE);

  const openCreate = (type: AddEntityType, prefill?: any) => setState({ open: true, type, mode: 'create', prefill });
  const openEdit = (type: AddEntityType, entity: any) => setState({ open: true, type, mode: 'edit', entity });
  const close = () => setState((s) => ({ ...s, open: false }));

  return (
    <AddPanelContext.Provider value={{ state, openCreate, openEdit, close }}>
      {children}
    </AddPanelContext.Provider>
  );
}

export function useAddPanel() {
  const ctx = useContext(AddPanelContext);
  if (!ctx) throw new Error('useAddPanel must be used within AddPanelProvider');
  return ctx;
}
