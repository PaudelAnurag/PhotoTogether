import { Linking, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Notice, P, Screen } from '../../components/ui';
import { docDims, findCountry, findDocument } from '../../data/documentRequirements';
import { colors } from '../../theme';

/** One document: size, resolution, rules, and the entry to the camera. */
export default function DocumentScreen() {
  const { country: code, doc: docId } = useLocalSearchParams<{ country: string; doc: string }>();
  const country = findCountry(code);
  // A link carrying only the country still works when that country has a single document.
  const doc = findDocument(code, docId) ?? (country?.documents.length === 1 ? country.documents[0] : undefined);
  if (!country || !doc) return <Screen><P>Unknown document.</P></Screen>;

  return (
    <Screen>
      <Stack.Screen options={{ title: doc.label }} />
      <P>{country.flag} {country.name}</P>

      <Card>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>Requirements</Text>
        <Text style={{ color: colors.muted }}>{docDims(doc)}</Text>
        {doc.rules.map((r) => (
          <View key={r.label} style={{ gap: 2, paddingVertical: 4 }}>
            <Text style={{ fontWeight: '700', color: colors.purpleDark }}>{r.label}</Text>
            <Text style={{ color: colors.ink, lineHeight: 21 }}>{r.value}</Text>
          </View>
        ))}
      </Card>

      {doc.checkWithAuthority.length > 0 && (
        <Notice tone="warn" text={`Also check with the issuing authority:\n• ${doc.checkWithAuthority.join('\n• ')}`} />
      )}
      <Text style={{ color: colors.muted, fontSize: 13 }} onPress={() => Linking.openURL(doc.source)}>
        Source: {doc.source}{'\n'}Read on {doc.verifiedOn}. Rules change — confirm with the issuing authority before applying. This app does not guarantee acceptance.
      </Text>

      <Button label="Open Camera" onPress={() => router.push({ pathname: '/official/camera', params: { country: country.code, doc: doc.id } })} />
    </Screen>
  );
}
