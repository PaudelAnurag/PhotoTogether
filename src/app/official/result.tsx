import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ExportBar } from '../../components/ExportBar';
import { Button, Notice, P, Screen } from '../../components/ui';
import { docDims, findDocument } from '../../data/documentRequirements';
import { emailAttachment, officialPdf, printOfficial, saveToDevice, shareFile } from '../../services/exportService';
import { checkFace, type FaceCheck } from '../../services/faceGuide';
import { officialStorage } from '../../services/tempStorage';
import { radius } from '../../theme';

export default function OfficialResult() {
  const p = useLocalSearchParams<{ country: string; doc: string; uri: string }>();
  const doc = findDocument(p.country, p.doc);
  const out = p.uri; // already cropped and sized by the crop screen
  const [face, setFace] = useState<FaceCheck>();
  const temp = useRef<string[]>([]); // PDFs created for sharing/email, deleted on exit

  // Leaving (back, Retake, Done) deletes this screen's files. Blocked while an export/print is running so no file vanishes mid-operation.
  const navigation = useNavigation<{ addListener(type: 'beforeRemove', cb: (e: { preventDefault(): void }) => void): () => void }>();
  const exporting = useRef(false);
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (exporting.current) return e.preventDefault();
        officialStorage.remove(out);
        temp.current.forEach((u) => officialStorage.remove(u));
      }),
    [navigation, out]
  );

  useEffect(() => {
    if (!doc || !out) return;
    let cancelled = false;
    checkFace(out, { width: doc.outputPx.width, height: doc.outputPx.height }, { x: 0, y: 0, w: 1, h: 1 }, doc).then((f) => !cancelled && setFace(f));
    return () => {
      cancelled = true;
    };
  }, [out, doc]);

  if (!doc || !out) return <Screen><P>Unknown document.</P></Screen>;

  const pdfThen = async <T,>(fn: (pdf: string) => Promise<T>) => {
    const pdf = await officialPdf(out!, doc.sizeMm);
    temp.current.push(pdf);
    return fn(pdf);
  };

  return (
    <Screen>
      <P>{doc.label} · {docDims(doc)}</P>
      <Image source={{ uri: out }} style={{ width: '100%', aspectRatio: doc.outputPx.width / doc.outputPx.height, borderRadius: radius.md }} contentFit="contain" />
      {face ? <Notice tone={face.status === 'ok' ? 'ok' : face.status === 'unavailable' ? 'info' : 'warn'} text={face.messages.join('\n')} /> : null}

      <ExportBar
          onBusy={(b) => (exporting.current = b)}
          actions={[
            { label: 'Save to device', primary: true, run: () => saveToDevice([out]) },
            { label: 'Share image', run: () => shareFile(out, 'image/jpeg') },
            { label: 'Create PDF & share', run: () => pdfThen((pdf) => shareFile(pdf, 'application/pdf')) },
            { label: 'Print', run: () => printOfficial(out, doc.sizeMm) },
            { label: 'Email as attachment', run: () => pdfThen((pdf) => emailAttachment(pdf, `${doc.label} photo`)) },
          ]}
        />
      <Notice text="This photo is kept only in temporary storage on this device and is deleted when you leave this screen. Save or share it first if you want to keep it." />
      <Button label="Retake" variant="secondary" onPress={() => router.dismissTo({ pathname: '/official/camera', params: { country: p.country, doc: p.doc } })} />
      <Button label="Done" variant="secondary" onPress={() => router.dismissTo('/home')} />
    </Screen>
  );
}
