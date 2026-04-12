'use client';

import { companyService } from '@/services/company.service';
import { CompanyWhiteLabel } from '@/types/company';
import {
  DEFAULT_WHITE_LABEL,
  mergeWhiteLabel,
} from '@/utils/white-label.utils';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
export {
  DEFAULT_WHITE_LABEL,
  mergeWhiteLabel,
} from '@/utils/white-label.utils';

type WhiteLabelContextValue = {
  whiteLabel: CompanyWhiteLabel;
  setWhiteLabel: (wl: CompanyWhiteLabel | null) => void;
};

const WhiteLabelContext = createContext<WhiteLabelContextValue>({
  whiteLabel: DEFAULT_WHITE_LABEL,
  setWhiteLabel: () => {},
});

export function WhiteLabelProvider({
  children,
  initialWhiteLabel,
}: {
  children: ReactNode;
  initialWhiteLabel?: CompanyWhiteLabel | null;
}) {
  const [whiteLabel, setWhiteLabelState] = useState<CompanyWhiteLabel>(
    mergeWhiteLabel(initialWhiteLabel),
  );

  // Fallback: if no server-provided value, populate from cookie after hydration
  useEffect(() => {
    if (!initialWhiteLabel) {
      setWhiteLabelState(
        mergeWhiteLabel(companyService.getDefaultCompany()?.whiteLabel),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWhiteLabel = useCallback((wl: CompanyWhiteLabel | null) => {
    setWhiteLabelState(mergeWhiteLabel(wl));
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
