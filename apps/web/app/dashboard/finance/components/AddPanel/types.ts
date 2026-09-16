// Shared contract every Add-panel subform implements. `submit`/`isDirty` are
// called imperatively by the Drawer's sticky footer (no need to be reactive);
// `isValid`/`isPending` are reported reactively via callback props so the
// footer button can enable/disable and show a loading state.
export interface AddSubformHandle {
  submit: () => void;
  isDirty: () => boolean;
}

export interface AddSubformProps {
  mode: 'create' | 'edit';
  entity?: any;
  prefill?: any;
  onDone: () => void;
  onValidChange: (valid: boolean) => void;
  onPendingChange: (pending: boolean) => void;
}
