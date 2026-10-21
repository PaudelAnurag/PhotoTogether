import * as MailComposer from 'expo-mail-composer';
import { Asset } from 'expo-media-library';
import { requestPermissionsAsync } from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export type Result = { ok: boolean; message: string };

const MM_TO_PT = 72 / 25.4;

async function dataUri(uri: string) {
  return `data:image/jpeg;base64,${await new File(uri).base64()}`;
}

export async function saveToDevice(uris: string[]): Promise<Result> {
  const perm = await requestPermissionsAsync(true);
  if (!perm.granted) return { ok: false, message: 'Photo library permission denied. Enable it in system Settings to save photos.' };
  try {
    for (const u of uris) await Asset.create(u);
    return { ok: true, message: `Saved ${uris.length} photo${uris.length > 1 ? 's' : ''} to your library.` };
  } catch (e) {
    return { ok: false, message: `Could not save: ${(e as Error).message}` };
  }
}

export async function shareFile(uri: string, mimeType: string): Promise<Result> {
  if (!(await Sharing.isAvailableAsync())) return { ok: false, message: 'Sharing is not available on this device.' };
  await Sharing.shareAsync(uri, { mimeType });
  return { ok: true, message: 'Share sheet opened.' };
}

export type PageSizeMm = { width: number; height: number };

/** One photo on a page of exactly the document's physical size — printed at 100% (no scaling). */
export async function officialHtml(uri: string, sizeMm: PageSizeMm) {
  const src = await dataUri(uri);
  return `<html><head><meta name="viewport" content="width=device-width"><style>
@page{size:${sizeMm.width}mm ${sizeMm.height}mm;margin:0}
html,body{margin:0;padding:0}
img{display:block;width:${sizeMm.width}mm;height:${sizeMm.height}mm}
</style></head><body><img src="${src}"/></body></html>`;
}

const pageOpts = (s: PageSizeMm) => ({ width: Math.round(s.width * MM_TO_PT), height: Math.round(s.height * MM_TO_PT) });

export async function printOfficial(uri: string, sizeMm: PageSizeMm): Promise<Result> {
  try {
    await Print.printAsync({ html: await officialHtml(uri, sizeMm), ...pageOpts(sizeMm) });
    return { ok: true, message: 'Print dialog closed.' };
  } catch (e) {
    return { ok: false, message: `Print failed: ${(e as Error).message}` };
  }
}

export async function officialPdf(uri: string, sizeMm: PageSizeMm) {
  const { uri: pdf } = await Print.printToFileAsync({ html: await officialHtml(uri, sizeMm), ...pageOpts(sizeMm) });
  return pdf;
}

/** A4 album: each row = one pair (A left, B right). */
export async function albumHtml(a: string[], b: string[]) {
  const rows = await Promise.all(
    a.map(async (u, i) => `<div class="row"><img src="${await dataUri(u)}"/><img src="${await dataUri(b[i])}"/></div>`)
  );
  return `<html><head><meta name="viewport" content="width=device-width"><style>
@page{size:A4;margin:12mm}
body{font-family:sans-serif;text-align:center;color:#241B3A}
h1{font-size:18pt;margin:0 0 6mm}
.row{display:flex;gap:4mm;margin-bottom:4mm;page-break-inside:avoid}
img{width:50%;aspect-ratio:3/4;object-fit:cover;border-radius:3mm}
</style></head><body><h1>PhotoTogether</h1>${rows.join('')}</body></html>`;
}

export async function albumPdf(a: string[], b: string[]) {
  const { uri } = await Print.printToFileAsync({ html: await albumHtml(a, b) });
  return uri;
}

export async function printAlbum(a: string[], b: string[]): Promise<Result> {
  try {
    await Print.printAsync({ html: await albumHtml(a, b) });
    return { ok: true, message: 'Print dialog closed.' };
  } catch (e) {
    return { ok: false, message: `Print failed: ${(e as Error).message}` };
  }
}

/** Opens the mail composer with the file attached. The user must still press Send — we cannot know if they did. */
export async function emailAttachment(uri: string, subject: string): Promise<Result> {
  if (Platform.OS === 'web' || !(await MailComposer.isAvailableAsync())) {
    return { ok: false, message: 'No email account is set up on this device. Use Share instead and pick an email app.' };
  }
  const r = await MailComposer.composeAsync({ subject, body: 'Attached from PhotoTogether.', attachments: [uri] });
  return { ok: true, message: `Email draft ${r.status}. Nothing is sent until you press Send in your email app.` };
}
