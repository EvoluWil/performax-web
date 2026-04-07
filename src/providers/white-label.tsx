'use client';

import { companyService } from '@/services/company.service';
import { CompanyWhiteLabel } from '@/types/company';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type WhiteLabelContextValue = {
  whiteLabel: CompanyWhiteLabel | null;
  setWhiteLabel: (wl: CompanyWhiteLabel | null) => void;
};

const WhiteLabelContext = createContext<WhiteLabelContextValue>({
  whiteLabel: null,
  setWhiteLabel: () => {},
});

export function WhiteLabelProvider({
  children,
  initialWhiteLabel,
}: {
  children: ReactNode;
  initialWhiteLabel?: CompanyWhiteLabel | null;
}) {
  const [whiteLabel, setWhiteLabelState] = useState<CompanyWhiteLabel | null>(
    initialWhiteLabel ?? null,
  );

  // Fallback: if no server-provided value, populate from cookie after hydration
  useEffect(() => {
    if (!initialWhiteLabel) {
      setWhiteLabelState(
        companyService.getDefaultCompany()?.whiteLabel ?? null,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWhiteLabel = useCallback((wl: CompanyWhiteLabel | null) => {
    setWhiteLabelState(wl);
    // Sync the cookie so PDF generator reads up-to-date whiteLabel
    const company = companyService.getDefaultCompany();
    if (company) {
      companyService.setDefaultCompany({
        ...company,
        whiteLabel: wl ?? undefined,
      });
    }
  }, []);

  return (
    <WhiteLabelContext.Provider value={{ whiteLabel, setWhiteLabel }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export const useWhiteLabel = () => useContext(WhiteLabelContext);
