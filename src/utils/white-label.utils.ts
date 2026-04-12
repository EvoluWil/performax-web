import { DEFAULT_BANNER } from '@/constants/whitelabel/banner.constant';
import { DEFAULT_FAVICON } from '@/constants/whitelabel/favicon.constant';
import { DEFAULT_LOGO } from '@/constants/whitelabel/logo.constant';
import { CompanyWhiteLabel } from '@/types/company';

export const DEFAULT_WHITE_LABEL: CompanyWhiteLabel = {
  id: '',
  name: 'Performax',
  logo: DEFAULT_LOGO,
  banner: DEFAULT_BANNER,
  favicon: DEFAULT_FAVICON,
  primaryColor: '#6B2AEE',
  secondaryColor: '#02E7D9',
  createdAt: new Date(0),
  updatedAt: new Date(0),
  companyId: '',
  company: null as any,
};

/**
 * Merges a raw (possibly partial) white label from the API with the system
 * defaults, so callers always receive a fully-populated object.
 *
 * Name rules:
 *  - has logo  + has name  → use name
 *  - has logo  + no name   → blank ('')
 *  - no logo   + no name   → use default name
 */
export function mergeWhiteLabel(
  raw: CompanyWhiteLabel | null | undefined,
): CompanyWhiteLabel {
  if (!raw) return DEFAULT_WHITE_LABEL;

  const logo = raw.logo || DEFAULT_WHITE_LABEL.logo;
  const hasLogo = !!raw.logo;
  const name = hasLogo
    ? (raw.name ?? '')
    : raw.name || DEFAULT_WHITE_LABEL.name;

  return {
    ...DEFAULT_WHITE_LABEL,
    ...raw,
    logo,
    name,
    banner: raw.banner || DEFAULT_WHITE_LABEL.banner,
    favicon: raw.favicon || DEFAULT_WHITE_LABEL.favicon,
    primaryColor: raw.primaryColor || DEFAULT_WHITE_LABEL.primaryColor,
    secondaryColor: raw.secondaryColor || DEFAULT_WHITE_LABEL.secondaryColor,
  };
}
