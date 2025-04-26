import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, Play, Square, Trash2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import Colors from '@/constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';

type AudioRecorderProps = {
  onRecordingComplete: (path: string) => void;
  existingAudioPath?: string | null;
};

export default function AudioRecorder({ onRecordingComplete, existingAudioPath }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(!!existingAudioPath);
  const [recordingPath, setRecordingPath] = useState<string | null>(existingAudioPath || null);
  const [permissionStatus, setPermissionStatus] = useState<Audio.PermissionStatus | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation for recording indicator
  const pulse = useSharedValue(1);
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: pulse.value * 0.7 + 0.3,
    };
  });

  useEffect(() => {
    checkPermissions();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (recording) {
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [recording, pulse]);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') return;
    
    const permission = await Audio.getPermissionsAsync();
    setPermissionStatus(permission.status);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Sorry', 'Recording is not supported on web platform.');
      return false;
    }

    const permission = await Audio.requestPermissionsAsync();
    setPermissionStatus(permission.status);
    
    if (!permission.granted) {
      Alert.alert(
        'Microphone Permission Required',
        'Please enable microphone access in your device settings to record audio.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return false;
    }
    
    return true;
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const uri = recording.getURI();
      if (uri) {
        setRecordingPath(uri);
        setHasRecording(true);
        onRecordingComplete(uri);
      }
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
    
    setRecording(null);
  };

  const playSound = async () => {
    if (!recordingPath) return;
    
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingPath },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      
    } catch (err) {
      console.error('Failed to play sound', err);
      Alert.alert('Error', 'Failed to play the recording');
    }
  };

  const stopSound = async () => {
    if (!sound) return;
    
    try {
      await sound.stopAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to stop sound', err);
    }
  };

  const deleteRecording = async () => {
    if (!recordingPath) return;
    
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              if (sound) {
                await sound.unloadAsync();
                setSound(null);
              }
              
              if (Platform.OS !== 'web' && recordingPath.startsWith('file://')) {
                await FileSystem.deleteAsync(recordingPath, { idempotent: true });
              }
              
              setRecordingPath(null);
              setHasRecording(false);
              onRecordingComplete('');
            } catch (err) {
              console.error('Failed to delete recording', err);
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {hasRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingText}>
            Recording {recordingDuration > 0 ? (`${formatDuration(recordingDuration)}`) : ''}
            </Text>
          </View>
          
          <View style={styles.controls}>
            {isPlaying ? (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={stopSound}
              >
                <Square size={24} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={playSound}
              >
                <Play size={24} color={Colors.light.tint} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={deleteRecording}
            >
              <Trash2 size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      ) : recording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingInfo}>
            <Animated.View style={[styles.recordingIndicator, pulseStyle]} />
            <Text style={styles.recordingText}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
          >
            <Square size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.recordButton,
            permissionStatus === 'denied' && styles.recordButtonDisabled
          ]}
          onPress={startRecording}
          // disabled={permissionStatus === 'denied'}
        >
          <Mic size={24} color="#fff" />
          <Text style={styles.recordButtonText}>
            {permissionStatus === 'denied' 
              ? 'Microphone Access Required'
              : 'Record Message'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
  },
  recordButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#4b5563',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#f1f5f9',
  },
});
