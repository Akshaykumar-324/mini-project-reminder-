// import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
// import { Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import { useAlarms } from '@/hooks/useAlarms';

// type NotificationContextType = {
//   hasPermission: boolean;
//   requestPermission: () => Promise<boolean>;
//   scheduleNotification: (options: NotificationOptions) => Promise<string>;
//   cancelNotification: (identifier: string) => Promise<void>;
// };

// type NotificationOptions = {
//   identifier?: string;
//   title: string;
//   body: string;
//   data?: any;
//   sound?: boolean;
//   trigger: any;
// };

// export const NotificationContext = createContext<NotificationContextType>({
//   hasPermission: false,
//   requestPermission: async () => false,
//   scheduleNotification: async () => '',
//   cancelNotification: async () => {},
// });

// type NotificationProviderProps = {
//   children: ReactNode;
// };

// export default function NotificationProvider({ children }: NotificationProviderProps) {
//   const [hasPermission, setHasPermission] = useState(false);
//   const { handleAlarmTrigger, snoozeAlarm, dismissAlarm } = useAlarms();

//   const checkPermissions = useCallback(async () => {
//     if (Platform.OS === 'web') {
//       return false;
//     }
    
//     const { status } = await Notifications.getPermissionsAsync();
//     const granted = status === 'granted';
//     setHasPermission(granted);
//     return granted;
//   }, []);

//   const requestPermission = useCallback(async () => {
//     if (Platform.OS === 'web') {
//       return false;
//     }
    
//     const { status } = await Notifications.requestPermissionsAsync();
//     const granted = status === 'granted';
//     setHasPermission(granted);
//     return granted;
//   }, []);

//   const scheduleNotification = useCallback(async (options: NotificationOptions) => {
//     if (Platform.OS === 'web') {
//       return '';
//     }
    
//     // Configure notification behavior
//     Notifications.setNotificationHandler({
//       handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: !!options.sound,
//         shouldSetBadge: true,
//       }),
//     });
    
//     // Schedule the notification
//     const identifier = await Notifications.scheduleNotificationAsync({
//       content: {
//         title: options.title,
//         body: options.body,
//         data: options.data || {},
//         sound: options.sound ? true : undefined,
//       },
//       trigger: options.trigger,
//       identifier: options.identifier,
//     });
    
//     return identifier;
//   }, []);

//   const cancelNotification = useCallback(async (identifier: string) => {
//     if (Platform.OS === 'web') {
//       return;
//     }
    
//     await Notifications.cancelScheduledNotificationAsync(identifier);
//   }, []);

//   useEffect(() => {
//     checkPermissions();
    
//     if (Platform.OS !== 'web') {
//       const subscription = Notifications.addNotificationReceivedListener(notification => {
//         const alarmId = notification.request.content.data?.alarmId;
//         if (alarmId) {
//           const alarm = {
//             id: alarmId,
//             audioPath: notification.request.content.data?.audioPath,
//           };
//           handleAlarmTrigger(alarm);
//         }
//       });

//       const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
//         const alarmId = response.notification.request.content.data?.alarmId;
//         const actionId = response.actionIdentifier;

//         if (alarmId) {
//           const alarm = {
//             id: alarmId,
//             audioPath: response.notification.request.content.data?.audioPath,
//           };
          
//           if (actionId === 'SNOOZE') {
//             snoozeAlarm(alarm);
//           } else {
//             dismissAlarm();
//           }
//         }
//       });

//       return () => {
//         subscription.remove();
//         responseSubscription.remove();
//       };
//     }
//   }, [handleAlarmTrigger, snoozeAlarm, dismissAlarm]);

//   return (
//     <NotificationContext.Provider
//       value={{
//         hasPermission,
//         requestPermission,
//         scheduleNotification,
//         cancelNotification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// }

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAlarms } from '@/hooks/useAlarms';
import { Audio } from 'expo-av';

type NotificationContextType = {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (options: NotificationOptions) => Promise<string>;
  cancelNotification: (identifier: string) => Promise<void>;
};

type NotificationOptions = {
  identifier?: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  trigger: any;
};

export const NotificationContext = createContext<NotificationContextType>({
  hasPermission: false,
  requestPermission: async () => false,
  scheduleNotification: async () => '',
  cancelNotification: async () => {},
});

type NotificationProviderProps = {
  children: ReactNode;
};

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { handleAlarmTrigger, snoozeAlarm, dismissAlarm } = useAlarms();

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const checkPermissions = useCallback(async () => {
    if (Platform.OS === 'web') {
      return false;
    }
    
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      return false;
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const playAlarmSound = useCallback(async (audioPath: string) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      console.log('Attempting to play audio from:', audioPath);
      
      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      
      setSound(newSound);
      console.log('Audio playback started successfully');
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
    }
  }, [sound]);

  const stopAlarmSound = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        console.log('Alarm sound stopped');
      } catch (error) {
        console.error('Failed to stop alarm sound:', error);
      }
    }
  }, [sound]);

  const scheduleNotification = useCallback(async (options: NotificationOptions) => {
    if (Platform.OS === 'web') {
      return '';
    }
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: !!options.sound,
        shouldSetBadge: true,
      }),
    });
    
    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        data: options.data || {},
        sound: options.sound ? true : undefined,
      },
      trigger: options.trigger,
      identifier: options.identifier,
    });
    
    return identifier;
  }, []);

  const cancelNotification = useCallback(async (identifier: string) => {
    if (Platform.OS === 'web') {
      return;
    }
    
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }, []);

  useEffect(() => {
    checkPermissions();
    
    if (Platform.OS !== 'web') {
      // Set up notification categories with actions
      Notifications.setNotificationCategoryAsync('alarm', [
        {
          identifier: 'SNOOZE',
          buttonTitle: 'Snooze',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'DISMISS',
          buttonTitle: 'Dismiss',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);

      const subscription = Notifications.addNotificationReceivedListener(notification => {
        const data = notification.request.content.data;
        const alarmId = data?.alarmId;
        const audioPath = data?.audioPath;
        
        console.log('Notification received:', { alarmId, audioPath });
        
        if (alarmId) {
          // Play the custom alarm sound if available
          if (audioPath) {
            playAlarmSound(audioPath);
          }
          
          const alarm = {
            id: alarmId,
            audioPath: audioPath,
          };
          handleAlarmTrigger(alarm);
        }
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        const alarmId = data?.alarmId;
        const actionId = response.actionIdentifier;

        console.log('Notification response received:', { alarmId, actionId });

        if (alarmId) {
          const alarm = {
            id: alarmId,
            audioPath: data?.audioPath,
          };
          
          if (actionId === 'SNOOZE') {
            snoozeAlarm(alarm);
          } else {
            stopAlarmSound();
            dismissAlarm();
          }
        }
      });

      return () => {
        subscription.remove();
        responseSubscription.remove();
        if (sound) {
          sound.unloadAsync();
        }
      };
    }
  }, [handleAlarmTrigger, snoozeAlarm, dismissAlarm, playAlarmSound, stopAlarmSound, sound]);

  return (
    <NotificationContext.Provider
      value={{
        hasPermission,
        requestPermission,
        scheduleNotification,
        cancelNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}