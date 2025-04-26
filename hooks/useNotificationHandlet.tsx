import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { useNotifications } from './useNotifications';

export function useNotificationHandler() {
  const { playAlarmSound } = useNotifications();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Set notification handler for when notification is received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;
      
      // Play the custom audio recording if available
      if (data.audioPath && typeof data.audioPath === 'string') {
        try {
          const sound = await playAlarmSound(data.audioPath);
          soundRef.current = sound;
        } catch (error) {
          console.error('Failed to play alarm sound:', error);
        }
      }
    });

    // Set notification handler for when notification is tapped/responded to
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data;
      
      // Handle the user's response to the notification
      // For example, navigate to a screen to turn off/snooze the alarm
      
      // Stop any playing sound when notification is interacted with
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
      
      // Clean up any playing sound
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [playAlarmSound]);

  // Function to manually stop alarm sound
  const stopAlarmSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  return {
    stopAlarmSound,
  };
}