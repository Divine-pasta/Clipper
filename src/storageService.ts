import * as MediaLibrary from 'expo-media-library';

export async function requestMediaPermissions() {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export interface SavedClip {
  id: string;
  timestamp: string;
  peakMps: number;
  channel: string;
}
