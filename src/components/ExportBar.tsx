import { useState } from 'react';
import { View } from 'react-native';
import { Button, Notice } from './ui';
import { space } from '../theme';
import type { Result } from '../services/exportService';

export type ExportAction = { label: string; run: () => Promise<Result>; primary?: boolean };

/** Row of export buttons; one runs at a time, and the outcome is shown honestly below. */
export function ExportBar({ actions, onBusy }: { actions: ExportAction[]; onBusy?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState<string>();
  const [result, setResult] = useState<Result>();

  const go = async (a: ExportAction) => {
    setBusy(a.label);
    onBusy?.(true);
    setResult(undefined);
    try {
      setResult(await a.run());
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setBusy(undefined);
      onBusy?.(false);
    }
  };

  return (
    <View style={{ gap: space.sm }}>
      {actions.map((a) => (
        <Button key={a.label} label={a.label} variant={a.primary ? 'primary' : 'secondary'} busy={busy === a.label} disabled={!!busy} onPress={() => go(a)} />
      ))}
      {result ? <Notice tone={result.ok ? 'ok' : 'error'} text={result.message} /> : null}
    </View>
  );
}
