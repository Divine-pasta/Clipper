import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

// Replace with your PC's local IP (e.g., http://192.168.1.10:3000) or cloud server URL
const SERVER_URL = 'http://192.168.1.40:3000';

export default function App() {
  const [streamUrl, setStreamUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [spikeCount, setSpikeCount] = useState(0);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Grant gallery permissions to save video clips.');
        }
      }
    })();
  }, []);

  // Polling loop to check server status and chat spikes every 3 seconds
  useEffect(() => {
    let interval: any;
    if (isMonitoring) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${SERVER_URL}/poll`);
          const data = await response.json();

          // Update message count based on sliding window activity from backend
          if (data.messagesLast4s !== undefined) {
            setMessageCount(data.messagesLast4s);
          }

          if (data.spikeDetected) {
            setSpikeCount((prev) => prev + 1);
            setLogs((prev) => [
              `[${new Date().toLocaleTimeString()}] 🚀 SPIKE DETECTED! Clipping last 30s...`,
              ...prev,
            ]);
          }

          // When the server finishes rendering the .mp4, download it to the phone gallery
          if (data.clipUrl) {
            await downloadAndSaveClip(`${SERVER_URL}${data.clipUrl}`);
          }
        } catch (err) {
          console.log('Poll error:', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const downloadAndSaveClip = async (remoteVideoUrl: string) => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const localUri = `${FileSystem.documentDirectory}clip_${Date.now()}.mp4`;
      const downloadRes = await FileSystem.downloadAsync(remoteVideoUrl, localUri);

      if (downloadRes.status === 200 && Platform.OS !== 'web') {
        const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
        const album = await MediaLibrary.getAlbumAsync('Clipper');
        if (!album) {
          await MediaLibrary.createAlbumAsync('Clipper', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        setLogs((prev) => [
          `[${timestamp}] ✅ MP4 Clip saved to Gallery (Clipper album)!`,
          ...prev,
        ]);
      }
    } catch (error) {
      setLogs((prev) => [
        `[${timestamp}] ⚠️ Failed to save MP4: ${error}`,
        ...prev,
      ]);
    }
  };

  const startMonitoring = async () => {
    if (!streamUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid YouTube Live URL.');
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: streamUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Stream Error', data.error || 'Could not connect to live chat.');
        return;
      }

      setIsMonitoring(true);
      setMessageCount(0);
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Connected to live chat!`, ...prev]);
    } catch (error) {
      Alert.alert('Connection Error', `Cannot reach Clipper server at ${SERVER_URL}`);
    }
  };

  const stopMonitoring = async () => {
    setIsMonitoring(false);
    try {
      await fetch(`${SERVER_URL}/stop`, { method: 'POST' });
    } catch (_) {}
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Stopped monitoring. Total spikes: ${spikeCount}`, ...prev]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clipper - Live Stream Monitor</Text>
        <Text style={styles.headerSubtitle}>Auto-saves 30s MP4s on chat spikes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>YouTube Live URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#6B7280"
            value={streamUrl}
            onChangeText={setStreamUrl}
            editable={!isMonitoring}
          />

          {!isMonitoring ? (
            <TouchableOpacity style={styles.startButton} onPress={startMonitoring}>
              <Text style={styles.startButtonText}>Start Monitoring</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopMonitoring}>
              <Text style={styles.stopButtonText}>Stop Monitoring</Text>
            </TouchableOpacity>
          )}
        </View>

        {isMonitoring && (
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Messages (Last 4s)</Text>
              <Text style={styles.statValue}>{messageCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Spikes Caught</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{spikeCount}</Text>
            </View>
          </View>
        )}

        <View style={styles.splitView}>
          <View style={styles.column}>
            <Text style={styles.columnHeader}>Activity & Saved Clips</Text>
            <ScrollView style={styles.logBox}>
              {logs.length === 0 ? (
                <Text style={styles.emptyText}>No activity recorded yet.</Text>
              ) : (
                logs.map((log, index) => (
                  <Text key={index} style={styles.logText}>{log}</Text>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17' },
  header: { padding: 20, backgroundColor: '#151A23', borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#F3F4F6' },
  headerSubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  content: { flex: 1, padding: 16, gap: 16 },
  inputCard: { backgroundColor: '#151A23', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1F2937', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#D1D5DB' },
  input: { backgroundColor: '#0B0F17', borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 12, color: '#FFF', fontSize: 14 },
  startButton: { backgroundColor: '#10B981', borderRadius: 8, padding: 14, alignItems: 'center' },
  startButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  stopButton: { backgroundColor: '#EF4444', borderRadius: 8, padding: 14, alignItems: 'center' },
  stopButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statsCard: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#151A23', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#9CA3AF' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#F3F4F6', marginTop: 4 },
  splitView: { flex: 1, flexDirection: 'row', gap: 16 },
  column: { flex: 1, backgroundColor: '#151A23', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  columnHeader: { fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8 },
  logBox: { flex: 1 },
  emptyText: { color: '#6B7280', fontStyle: 'italic', fontSize: 13 },
  logText: { color: '#9CA3AF', fontSize: 12, marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
