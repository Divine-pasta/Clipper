import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const startMonitoring = () => {
    if (!channelUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid YouTube Live URL or channel name.');
      return;
    }
    setIsMonitoring(true);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Started monitoring: ${channelUrl}`, ...prev]);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Stopped monitoring.`, ...prev]);
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

        <View style={styles.splitView}>
          <View style={styles.column}>
            <Text style={styles.columnHeader}>Activity Logs</Text>
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
  chatMessage: {
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 6,
  },
  chatUser: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  clipCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  clipDetails: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
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
