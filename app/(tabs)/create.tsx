import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/Header';
import TimePicker from '@/components/TimePicker';
import WeekdaySelector from '@/components/WeekdaySelector';
import AudioRecorder from '@/components/AudioRecorder';
import LabelInput from '@/components/LabelInput';
import Button from '@/components/Button';
import { useAlarms } from '@/hooks/useAlarms';

export default function CreateAlarmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAlarm, saveAlarm } = useAlarms();
  
  const [time, setTime] = useState({ hours: 8, minutes: 0, period: 'AM' });
  const [days, setDays] = useState([false, true, true, true, true, true, false]);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (id) {
      const alarm = getAlarm(id);
      if (alarm) {
        setIsEditing(true);
        setTime({
          hours: alarm.hours,
          minutes: alarm.minutes,
          period: alarm.period
        });
        setDays(alarm.days);
        setAudioPath(alarm.audioPath);
        setLabel(alarm.label || '');
      }
    }
  }, [id, getAlarm]);

  const handleSave = () => {
    if (!audioPath) {
      Alert.alert('Missing Audio', 'Please record an audio message for your alarm.');
      return;
    }

    const newAlarm = {
      id: isEditing ? id : Date.now().toString(),
      hours: time.hours,
      minutes: time.minutes,
      period: time.period,
      days,
      audioPath,
      label,
      isActive: true,
      createdAt: isEditing ? undefined : new Date().toISOString(),
    };

    saveAlarm(newAlarm);
    router.push('/');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={isEditing ? "Edit Alarm" : "Create Alarm"}
        showBackButton
      />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Time</Text>
        <TimePicker 
          value={time}
          onChange={setTime}
        />

        <Text style={styles.sectionTitle}>Repeat</Text>
        <WeekdaySelector 
          selected={days}
          onChange={setDays}
        />

        <Text style={styles.sectionTitle}>Audio Message</Text>
        <AudioRecorder 
          onRecordingComplete={setAudioPath}
          existingAudioPath={audioPath}
        />

        <Text style={styles.sectionTitle}>Label</Text>
        <LabelInput
          value={label}
          onChange={setLabel}
          placeholder="Alarm label (optional)"
        />

        <View style={styles.buttonContainer}>
          <Button 
            title={isEditing ? "Update Alarm" : "Save Alarm"}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Extra padding for iOS
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#1f2937',
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: Platform.OS === 'ios' ? 32 : 16, // Extra margin for iOS
  },
});