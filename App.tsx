import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [spikeCount, setSpikeCount] = useState(0);

  // Simulate incoming chat stream & velocity check when monitoring is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        // Simulate random incoming chat messages (velocity)
        const incomingMessages = Math.floor(Math.random() * 8) + 1; 
        setMessageCount((prev) => {
          const updated = prev + incomingMessages;
          return updated;
        });

        // Detect velocity spike (e.g. if jump is high)
        if (incomingMessages > 6) {
          setSpikeCount((prev) => {
            const newSpikes = prev + 1;
            setLogs((logList) => [
              `[${new Date().toLocaleTimeString()}] 🚀 SPIKE DETECTED! Chat velocity surged. Saving 30s clip #${newSpikes}...`,
              ...logList,
            ]);
            return newSpikes;
          });
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startMonitoring = () => {
    if (!channelUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid YouTube Live URL or channel name.');
      return;
    }
    setIsMonitoring(true);
    setMessageCount(0);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Started monitoring: ${channelUrl}`, ...prev]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Stopped monitoring. Total spikes caught: ${spikeCount}`, ...prev]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clipper - Live Monitor</Text>
        <Text style={styles.headerSubtitle}>Auto-clip chat velocity spikes</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>YouTube Live / Stream URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#6B7280"
            value={channelUrl}
            onChangeText={setChannelUrl}
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
              <Text style={styles.statLabel}>Total Messages</Text>
              <Text style={styles.statValue}>{messageCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Spikes Captured</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{spikeCount}</Text>
            </View>
          </View>
        )}

        <View style={styles.splitView}>
          <View style={styles.column}>
            <Text style={styles.columnHeader}>Activity & Clip Logs</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    padding: 20,
    backgroundColor: '#151A23',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3F4F6',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  inputCard: {
    backgroundColor: '#151A23',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  input: {
    backgroundColor: '#0B0F17',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsCard: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#151A23',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginTop: 4,
  },
  splitView: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    backgroundColor: '#151A23',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  logBox: {
    flex: 1,
  },
  emptyText: {
    color: '#6B7280',
    fontStyle: 'italic',
    fontSize: 13,
  },
  logText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
