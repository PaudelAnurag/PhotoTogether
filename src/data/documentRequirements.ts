import type { Country, DocumentRequirement } from '../types';

const VERIFIED_ON = '2026-10-19';
const IN_TO_MM = 25.4;
const px300 = (mm: number) => Math.round((mm / IN_TO_MM) * 300);
const mm300 = (px: number) => Math.round((px / 300) * IN_TO_MM);

const US_SRC = 'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html';
const CA_SRC = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html';
const AU_SRC = 'https://www.passports.gov.au/sites/default/files/documents/2026-03/Camera%20operator%20guidelines.pdf';
const GB_SRC = 'https://www.gov.uk/photos-for-passports';

const usPassport: DocumentRequirement = {
  id: 'us-passport',
  kind: 'passport',
  label: 'Passport',
  sizeMm: { width: 51, height: 51 },
  outputPx: { width: 600, height: 600 }, // 2x2 in at 300 dpi; the source gives no pixel count
  background: 'White or off-white',
  headRatio: { min: 25 / 51, max: 35 / 51 },
  rules: [
    { label: 'Size', value: '2 x 2 in (51 x 51 mm)' },
    { label: 'Head height', value: '1 – 1 3/8 in (25 – 35 mm), chin to top of head' },
    { label: 'Background', value: 'White or off-white, plain, no shadows' },
    { label: 'Expression', value: 'Face the camera, neutral, eyes open, mouth closed (smiling allowed with eyes open and mouth closed)' },
    { label: 'Glasses', value: 'Remove all glasses; a signed doctor’s note is needed if medically impossible' },
    { label: 'Headwear', value: 'Remove, unless religious/medical with a signed statement; full face visible' },
    { label: 'Print', value: 'Matte or glossy photo paper; no scans or photocopies' },
  ],
  verified: true,
  source: US_SRC,
  verifiedOn: VERIFIED_ON,
  checkWithAuthority: ['Eye-height range', 'Pixel dimensions (600x600 px = 2 in at 300 dpi is our choice)'],
};

const caPassport: DocumentRequirement = {
  id: 'ca-passport',
  kind: 'passport',
  label: 'Passport (printed photos)',
  sizeMm: { width: 50, height: 70 },
  outputPx: { width: px300(50), height: px300(70) },
  background: 'Plain white or light-coloured',
  headRatio: { min: 31 / 70, max: 36 / 70 },
  rules: [
    { label: 'Size', value: '50 mm wide x 70 mm high' },
    { label: 'Face height', value: '31 – 36 mm, chin to crown' },
    { label: 'Background', value: 'Plain white or light-coloured, clear contrast with the face' },
    { label: 'Expression', value: 'Neutral, eyes open, looking straight ahead, mouth closed' },
    { label: 'Glasses', value: 'Allowed if eyes are visible and no glare; no tinted lenses' },
    { label: 'Headwear', value: 'Only if worn daily for religious/medical reasons, full face visible' },
    { label: 'Copies', value: '2 identical, unaltered, professionally printed photos' },
  ],
  verified: true,
  source: CA_SRC,
  verifiedOn: VERIFIED_ON,
  checkWithAuthority: ['Print resolution (300 dpi is our choice)', 'Home printing is NOT accepted by the source'],
};

const caPassportOnline: DocumentRequirement = {
  id: 'ca-passport-online',
  kind: 'passport-online',
  label: 'Passport (online renewal, digital)',
  sizeMm: { width: mm300(1200), height: mm300(1800) }, // only used for the PDF/print layout; never shown
  outputPx: { width: 1200, height: 1800 },
  digital: true,
  background: 'Plain white or light-coloured',
  headRatio: { min: 0.45, max: 0.5 },
  rules: [
    { label: 'Format', value: 'JPEG, 3:2 portrait' },
    { label: 'Pixels', value: 'At least 1,800 x 1,200; at most 4,500 x 3,000' },
    { label: 'File size', value: '200 KB – 5 MB' },
    { label: 'Head height', value: 'Chin to crown is 45% – 50% of photo height' },
    { label: 'Source', value: 'Must come directly from the original camera file; scans not accepted' },
  ],
  verified: true,
  source: CA_SRC,
  verifiedOn: VERIFIED_ON,
  checkWithAuthority: ['File size is not checked by this app — confirm 200 KB – 5 MB before upload'],
};

const auPassport: DocumentRequirement = {
  id: 'au-passport',
  kind: 'passport',
  label: 'Passport',
  sizeMm: { width: 35, height: 45 },
  outputPx: { width: px300(35), height: px300(45) },
  background: 'White or light grey, contrasting with the subject, no shadows',
  headRatio: undefined,
  rules: [
    { label: 'Print size', value: '35 mm wide x 45 mm high' },
    { label: 'Background', value: 'White or light grey, no shadows' },
    { label: 'Expression', value: 'Neutral, no smiling, mouth closed' },
    { label: 'Glasses', value: 'Not permitted; medical exception needs a certificate and unobscured eyes' },
    { label: 'Headwear', value: 'Must not cover the face; hair must not cover the face' },
    { label: 'Print', value: 'Heavy-weight glossy paper, 200 gsm minimum, dye sublimation only' },
  ],
  verified: true,
  source: AU_SRC,
  verifiedOn: VERIFIED_ON,
  checkWithAuthority: ['Face height (chin to crown) — the guide shows a generic frame only', 'Pixel resolution'],
};

const gbPassportOnline: DocumentRequirement = {
  id: 'gb-passport-online',
  kind: 'passport-online',
  label: 'Passport (online application, digital)',
  sizeMm: { width: mm300(600), height: mm300(750) }, // only used for the PDF/print layout; never shown
  outputPx: { width: 600, height: 750 },
  digital: true,
  background: 'Plain light-coloured, clear contrast with the subject',
  headRatio: undefined,
  rules: [
    { label: 'Pixels', value: 'At least 600 wide x 750 tall' },
    { label: 'File size', value: '50 KB – 10 MB' },
    { label: 'Framing', value: 'Head, shoulders and upper body; do not crop (the service crops it)' },
    { label: 'Background', value: 'Plain light-coloured, no shadows' },
    { label: 'Expression', value: 'Plain expression, mouth closed, eyes open and visible, facing forward' },
    { label: 'Glasses / headwear', value: 'Avoid glasses unless necessary; no head covering unless religious/medical' },
    { label: 'Age of photo', value: 'Taken in the last month' },
  ],
  verified: true,
  source: GB_SRC,
  verifiedOn: VERIFIED_ON,
  checkWithAuthority: [
    'Head size / face height',
    'Aspect ratio — 600 x 750 px is the stated minimum, used here as the output size',
    'Printed-photo rules (separate GOV.UK page, not verified)',
  ],
};

export const COUNTRIES: Country[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺', documents: [auPassport] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', documents: [caPassport, caPassportOnline] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', documents: [gbPassportOnline] },
  { code: 'US', name: 'United States', flag: '🇺🇸', documents: [usPassport] },
];

export const findCountry = (code?: string) => COUNTRIES.find((c) => c.code === code);

export const findDocument = (country?: string, docId?: string) =>
  findCountry(country)?.documents.find((d) => d.id === docId);

/** "height × width" for display: print size (if physical) and required pixel size. */
export const docDims = (d: DocumentRequirement) =>
  `${d.digital ? '' : `${d.sizeMm.height} × ${d.sizeMm.width} mm · `}${d.outputPx.height} × ${d.outputPx.width} px`;
