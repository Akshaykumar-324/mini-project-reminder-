import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAlarmSound() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    loadVolume();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadVolume = async () => {
    const savedVolume = await AsyncStorage.getItem('alarmVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume) / 100);
    }
  };

  const playAlarmSound = async (audioPath: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { 
          isLooping: true,
          volume: volume,
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000,
        }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Add a listener for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  const stopAlarmSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping alarm sound:', error);
      }
    }
  };

  const setAlarmVolume = async (newVolume: number) => {
    const normalizedVolume = newVolume / 100;
    setVolume(normalizedVolume);
    if (sound) {
      await sound.setVolumeAsync(normalizedVolume);
    }
    await AsyncStorage.setItem('alarmVolume', newVolume.toString());
  };

  return {
    playAlarmSound,
    stopAlarmSound,
    isPlaying,
    setAlarmVolume,
  };
}