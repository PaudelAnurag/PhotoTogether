export type CapturedPhoto = { uri: string; width: number; height: number };

export type DocumentKind = 'passport' | 'passport-online' | 'visa' | 'national-id';

export type DocumentRequirement = {
  id: string;
  kind: DocumentKind;
  label: string;
  /** Printed/physical size in millimetres. Used for the print layout. */
  sizeMm: { width: number; height: number };
  /** Pixel size of the exported image. */
  outputPx: { width: number; height: number };
  background: string;
  /** Chin-to-crown as a fraction of photo height; undefined = official source gives no figure. */
  headRatio?: { min: number; max: number };
  /** Plain-language rules exactly as stated by the source; omit what the source does not state. */
  rules: { label: string; value: string }[];
  /** True only if every number above was read from `source` on `verifiedOn`. */
  verified: boolean;
  source: string;
  verifiedOn: string;
  /** Points the source does not settle; shown as "check with the issuing authority" instead of guessing. */
  checkWithAuthority: string[];
  /** Digital upload only: no physical print size is specified, so none is shown. */
  digital?: boolean;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
  documents: DocumentRequirement[];
};

export type TogetherRole = 'A' | 'B';

export type TogetherSession = {
  id: string;
  count: number;
  photos: Record<TogetherRole, string[]>;
  revealed: boolean;
};

export type ExportKind = 'save' | 'share' | 'print' | 'pdf' | 'email';
