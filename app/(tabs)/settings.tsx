import { View, Text, StyleSheet, Switch, ScrollView, Alert, Platform } from 'react-native';
import Header from '@/components/Header';
import { useNotifications } from '@/hooks/useNotifications';
import ListItem from '@/components/ListItem';
import { useState } from 'react';
import { Bell, Volume2, Clock, Moon, Sun, Trash2, Database, Vibrate as Vibration, Share2 } from 'lucide-react-native';
import { useAlarms } from '@/hooks/useAlarms';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { hasPermission, requestPermission } = useNotifications();
  const { clearAllAlarms, alarms } = useAlarms();
  const [snoozeTime, setSnoozeTime] = useState(5);
  const [soundVolume, setSoundVolume] = useState(80);
  const [darkMode, setDarkMode] = useState(false);
  const [vibrate, setVibrate] = useState(true);

  const handleClearAlarms = () => {
    Alert.alert(
      'Clear All Alarms',
      'Are you sure you want to delete all alarms? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: clearAllAlarms,
          style: 'destructive'
        }
      ]
    );
  };

  const handleSnoozeTimeChange = () => {
    Alert.alert(
      'Snooze Duration',
      'Select snooze duration in minutes',
      [
        { text: '5 min', onPress: () => setSnoozeTime(5) },
        { text: '10 min', onPress: () => setSnoozeTime(10) },
        { text: '15 min', onPress: () => setSnoozeTime(15) },
      ]
    );
  };

  const handleVolumeChange = () => {
    Alert.alert(
      'Alarm Volume',
      'Select alarm volume',
      [
        { text: '60%', onPress: () => setSoundVolume(60) },
        { text: '80%', onPress: () => setSoundVolume(80) },
        { text: '100%', onPress: () => setSoundVolume(100) },
      ]
    );
  };

  const calculateStorage = async () => {
    try {
      const storageSize = await AsyncStorage.getItem('alarms');
      const sizeInKB = storageSize ? (JSON.stringify(storageSize).length / 1024).toFixed(2) : '0';
      Alert.alert('Storage Usage', `Current storage used: ${sizeInKB} KB`);
    } catch (error) {
      Alert.alert('Error', 'Could not calculate storage usage');
    }
  };

  const handleExportData = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Export is not available on web');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      const data = JSON.stringify(alarms, null, 2);
      const fileUri = FileSystem.documentDirectory + 'alarms.json';
      await FileSystem.writeAsStringAsync(fileUri, data);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.card}>
          <ListItem 
            icon={<Bell size={22} color={Colors.light.tint} />}
            title="Allow Notifications"
            subtitle={hasPermission ? "Enabled" : "Disabled"}
            rightElement={
              <Switch 
                value={hasPermission}
                onValueChange={requestPermission}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={hasPermission ? '#3b82f6' : '#9ca3af'}
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.card}>
          <ListItem 
            icon={<Clock size={22} color={Colors.light.tint} />}
            title="Snooze Duration"
            subtitle={`${snoozeTime} minutes`}
            onPress={handleSnoozeTimeChange}
          />
          
          <View style={styles.divider} />
          
          <ListItem 
            icon={<Volume2 size={22} color={Colors.light.tint} />}
            title="Alarm Volume"
            subtitle={`${soundVolume}%`}
            onPress={handleVolumeChange}
          />
          
          <View style={styles.divider} />
          
          <ListItem 
            icon={<Vibration size={22} color={Colors.light.tint} />}
            title="Vibration"
            rightElement={
              <Switch 
                value={vibrate}
                onValueChange={setVibrate}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={vibrate ? '#3b82f6' : '#9ca3af'}
              />
            }
          />
          
          <View style={styles.divider} />
          
          <ListItem 
            icon={darkMode ? <Moon size={22} color={Colors.light.tint} /> : <Sun size={22} color={Colors.light.tint} />}
            title="Dark Mode"
            rightElement={
              <Switch 
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={darkMode ? '#3b82f6' : '#9ca3af'}
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <View style={styles.card}>
          <ListItem 
            icon={<Database size={22} color={Colors.light.tint} />}
            title="Storage Used"
            subtitle="Calculate storage"
            onPress={calculateStorage}
          />
          
          <View style={styles.divider} />
          
          <ListItem 
            icon={<Share2 size={22} color={Colors.light.tint} />}
            title="Export Data"
            subtitle="Export alarms as JSON"
            onPress={handleExportData}
          />
          
          <View style={styles.divider} />
          
          <ListItem 
            icon={<Trash2 size={22} color="#ef4444" />}
            title="Clear All Alarms"
            subtitle="Delete all alarms and recordings"
            titleStyle={{ color: '#ef4444' }}
            onPress={handleClearAlarms}
          />
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Alarm App v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});