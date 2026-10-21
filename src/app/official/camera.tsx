import { useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import { CameraCapture } from '../../components/CameraCapture';
import { GuideOverlay } from '../../components/GuideOverlay';
import { P, Screen } from '../../components/ui';
import { findDocument } from '../../data/documentRequirements';
import { officialStorage } from '../../services/tempStorage';
import { colors } from '../../theme';

export default function OfficialCamera() {
  const { country, doc: docId } = useLocalSearchParams<{ country: string; doc: string }>();
  const doc = findDocument(country, docId);
  const going = useRef(false);
  if (!doc) return <Screen><P>Unknown document.</P></Screen>;

  return (
    <View style={{ flex: 1 }}>
      <CameraCapture
        showFlash={false}
        initialFacing="front"
        overlay={<GuideOverlay doc={doc} tone={colors.ok} />}
        onCapture={async (photo) => {
          if (going.current) return;
          going.current = true;
          try {
            // Move out of the camera's cache into our own temporary folder so cleanup is in one place.
            const uri = await officialStorage.saveTemp(photo.uri);
            await officialStorage.remove(photo.uri);
            router.push({ pathname: '/official/crop', params: { country, doc: docId, uri, w: String(photo.width), h: String(photo.height) } });
          } finally {
            going.current = false;
          }
        }}
      />
    </View>
  );
}
