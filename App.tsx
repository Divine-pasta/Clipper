import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useYouTubeChat } from './src/youtubeService';
import { requestMediaPermissions, SavedClip } from './src/storageService';

export default function App() {
  useKeepAwake();

  const [urlInput, setUrlInput] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMps, setCurrentMps] = useState(0);
  const [statusText, setStatusText] = useState('Idle');
  const [clips, setClips] = useState<SavedClip[]>([]);
  const [chatFeed, setChatFeed] = useState<{ id: string; user: string; text: string }[]>([]);

  useYouTubeChat({
    videoUrl: activeUrl,
    onNewMessage: (user, text) => {
      setCurrentMps((prev) => prev + 1);
      setChatFeed((prev) => [{ id: Math.random().toString(), user, text }, ...prev.slice(0, 19)]);
    },
    onMessageSpike: (mps) => {
      setStatusText(`🔥 YOUTUBE SPIKE DETECTED (${mps} msg/s)! Saving clip marker...`);

      const newClip: SavedClip = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        peakMps: mps,
        channel: 'YouTube Live',
      };
      setClips((prev) => [newClip, ...prev]);

      setTimeout(() => {
        setStatusText('Monitoring active...');
      }, 3000);
    },
  });

  const handleStart = async () => {
    if (!urlInput.trim()) return;
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      alert('Media library permissions required.');
      return;
    }
    setActiveUrl(urlInput.trim());
    setIsMonitoring(true);
    setStatusText('Connected to YouTube Live chat...');
  };

  const handleStop = () => {
    setIsMonitoring(false);
    setActiveUrl('');
    setStatusText('Stopped');
    setCurrentMps(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔴 YouTube Live Auto-Clipper MVP</Text>
        <Text style={styles.statusSubtitle}>{statusText}</Text>
      </View>

      {!isMonitoring ? (
        <View style={styles.setupCard}>
          <Text style={styles.label}>Paste YouTube Live Stream URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#666"
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>Start YouTube Monitoring</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.dashboard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Current Chat Velocity</Text>
              <Text style={styles.metricValue}>
                {currentMps} <Text style={styles.unit}>msg/s</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Text style={styles.stopButtonText}>Stop Session</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.splitView}>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Live Chat Stream</Text>
              <FlatList
                data={chatFeed}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    <Text style={styles.chatUser}>{item.user}: </Text>
                    {item.text}
                  </Text>
                )}
              />
            </View>

            <View style={styles.column}>
              <Text style={styles.columnHeader}>Auto-Saved Spikes ({clips.length})</Text>
              <FlatList
                data={clips}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.clipCard}>
                    <Text style={styles.clipTitle}>Hype Spike Marker</Text>
                    <Text style={styles.clipDetails}>
                      Peak: {item.peakMps} msg/s • {item.timestamp}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14', padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statusSubtitle: { fontSize: 14, color: '#10B981', marginTop: 4 },
  setupCard: { backgroundColor: '#151A23', padding: 24, borderRadius: 12, marginTop: 40, maxWidth: 500, alignSelf: 'center', width: '100%' },
  label: { color: '#9CA3AF', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: '#1F2937', color: '#FFF', padding: 14, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  startButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  dashboard: { flex: 1 },
  metricsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: '#151A23', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' },
  metricTitle: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
  metricValue: { color: '#EF4444', fontSize: 28, fontWeight: 'bold' },
  unit: { fontSize: 14, color: '#6B7280', fontWeight: 'normal' },
  stopButton: { backgroundColor: '#374151', justifyContent: 'center', paddingHorizontal: 24, borderRadius: 12 },
  stopButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  splitView: { flex: 1, flexDirection: 'row', gap: 16 },
  column: { flex: 1, backgroundColor: '#151A23', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1
