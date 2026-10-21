import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, H1, P, Screen } from '../../components/ui';
import { COUNTRIES, docDims } from '../../data/documentRequirements';
import { colors, radius } from '../../theme';

/** Select Country: each country expands in place to its documents; a document opens its own page. */
export default function SelectCountry() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string>();
  const searching = q.trim() !== '';
  const list = useMemo(() => COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())), [q]);

  return (
    <Screen header={false}>
      <H1>Select Country</H1>
      <TextInput
        accessibilityLabel="Search country"
        placeholder="Search country…"
        placeholderTextColor={colors.muted}
        value={q}
        onChangeText={setQ}
        style={{ backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 20, height: 52, fontSize: 16, color: colors.ink }}
      />
      <P>Only countries whose requirements were verified against an official source are listed.</P>
      {list.map((c) => {
        const isOpen = searching || open === c.code; // searching shows matches already expanded
        return (
          <View key={c.code} style={{ gap: 8 }}>
            <Card onPress={() => setOpen(open === c.code ? undefined : c.code)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 32 }}>{c.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>{c.name}</Text>
                <Text style={{ color: colors.muted }}>{c.documents.length} document{c.documents.length > 1 ? 's' : ''}</Text>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={22} color={colors.purple} />
            </Card>
            {isOpen && (
              <View style={{ marginLeft: 28, paddingLeft: 12, gap: 8, borderLeftWidth: 2, borderLeftColor: colors.line }}>
                {c.documents.map((d) => (
                  <Card key={d.id} onPress={() => router.push({ pathname: '/official/document', params: { country: c.code, doc: d.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{d.label}</Text>
                      <Text style={{ color: colors.muted }}>{docDims(d)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.purple} />
                  </Card>
                ))}
              </View>
            )}
          </View>
        );
      })}
      {list.length === 0 && <P>No supported country matches “{q}”.</P>}
    </Screen>
  );
}
