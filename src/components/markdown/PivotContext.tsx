import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface PivotStateMap {
  [setId: string]: string; // selected pivot value per set
}

interface PivotContextValue {
  selections: PivotStateMap;
  setSelection: (setId: string, value: string) => void;
}

const PivotContext = createContext<PivotContextValue | undefined>(undefined);

export const PivotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<PivotStateMap>({});

  const setSelection = useCallback((setId: string, value: string) => {
    setSelections(prev => {
      if (prev[setId] === value) return prev;
      return { ...prev, [setId]: value };
    });
  }, []);

  const value = useMemo(() => ({ selections, setSelection }), [selections, setSelection]);
  return <PivotContext.Provider value={value}>{children}</PivotContext.Provider>;
};

export function usePivotSelection(setId: string, defaultValue: string) {
  const ctx = useContext(PivotContext);
  if (!ctx) throw new Error('usePivotSelection must be used within PivotProvider');
  const { selections, setSelection } = ctx;
  const selected = selections[setId] || defaultValue;
  return { selected, setSelection };
}
