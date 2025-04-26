// import { useCallback, useContext } from 'react';
// import { Platform } from 'react-native';
// import { NotificationContext } from '@/providers/NotificationProvider';
// import { Alarm } from '@/types/alarm';
// import { getNextAlarmDate } from '@/utils/timeUtils';

// export function useNotifications() {
//   const { 
//     hasPermission,
//     requestPermission,
//     scheduleNotification,
//     cancelNotification
//   } = useContext(NotificationContext);

//   const scheduleAlarmNotification = useCallback(async (alarm: Alarm) => {
//     if (Platform.OS === 'web') {
//       console.log('Notifications not supported on web');
//       return false;
//     }
    
//     if (!hasPermission) {
//       return false;
//     }
    
//     if (!alarm.isActive) {
//       return false;
//     }
    
//     try {
//       // Cancel any existing notifications for this alarm
//       await cancelNotification(alarm.id);
//       console.log('Cancelled existing notification for alarm:', alarm);
      
//       // Get the next occurrence of this alarm
//       const nextAlarmDate = getNextAlarmDate(alarm);
      
//       if (!nextAlarmDate) {
//         return false;
//       }
      
//       // Debug log to check the next alarm date
//       console.log('Next alarm date:', nextAlarmDate, 'Current time:', new Date());
      
//       // Ensure the date is in the future (at least 5 seconds from now)
//       const now = new Date();
//       if (nextAlarmDate.getTime() - now.getTime() < 5000) {
//         console.warn('Alarm date is too close to current time, might trigger immediately');
//         return false;
//       }
      
//       const title = alarm.label || 'Alarm';
//       const body = 'Your custom alarm is going off!';
      
//       await scheduleNotification({
//         identifier: alarm.id,
//         title,
//         body,
//         data: { 
//           alarmId: alarm.id,
//           audioPath: alarm.audioPath  // Ensure audioPath is passed in data
//         },
//         trigger: { date: nextAlarmDate },
//         sound: true,
//       });
      
//       console.log('Successfully scheduled alarm for:', nextAlarmDate);
//       return true;
//     } catch (error) {
//       console.error('Failed to schedule alarm notification:', error);
//       return false;
//     }
//   }, [hasPermission, scheduleNotification, cancelNotification]);

//   const cancelAlarmNotification = useCallback(async (alarmId: string) => {
//     if (Platform.OS === 'web') {
//       return;
//     }
    
//     try {
//       await cancelNotification(alarmId);
//     } catch (error) {
//       console.error('Failed to cancel alarm notification:', error);
//     }
//   }, [cancelNotification]);

//   return {
//     hasPermission,
//     requestPermission,
//     scheduleAlarmNotification,
//     cancelAlarmNotification,
//   };
// }
import { useCallback, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { NotificationContext } from '@/providers/NotificationProvider';
import { Alarm } from '@/types/alarm';
import { getNextAlarmDate } from '@/utils/timeUtils';

export function useNotifications() {
  const { 
    hasPermission,
    requestPermission,
    scheduleNotification,
    cancelNotification
  } = useContext(NotificationContext);

  // Helper function to ensure the time calculation is correct
  const ensureValidNextAlarmTime = (alarm: Alarm) => {
    const nextAlarmDate = getNextAlarmDate(alarm);
    
    if (!nextAlarmDate) {
      console.warn('Could not calculate next alarm date');
      return null;
    }
    
    const now = new Date();
    // If the calculated time is less than 5 seconds in the future, it's probably wrong
    if (nextAlarmDate.getTime() - now.getTime() < 5000) {
      console.warn('Next alarm time is too close to current time, adjusting');
      // Try to find the next day's occurrence instead
      const adjustedDate = new Date(nextAlarmDate);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      return adjustedDate;
    }
    
    return nextAlarmDate;
  };

  const scheduleAlarmNotification = useCallback(async (alarm: Alarm) => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }
    
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        console.log('Notification permission not granted');
        return false;
      }
    }
    
    if (!alarm.isActive) {
      console.log('Alarm is not active, skipping notification scheduling');
      return false;
    }
    
    try {
      // Cancel any existing notifications for this alarm
      await cancelNotification(alarm.id);
      console.log('Cancelled existing notification for alarm:', alarm);
      
      // Get the next occurrence of this alarm with validation
      const nextAlarmDate = ensureValidNextAlarmTime(alarm);
      
      if (!nextAlarmDate) {
        return false;
      }
      
      console.log('Scheduling alarm for:', nextAlarmDate.toLocaleString(), 'Current time:', new Date().toLocaleString());
      
      const title = alarm.label || 'Alarm';
      const body = 'Your custom alarm is going off!';
      
      const identifier = await scheduleNotification({
        identifier: alarm.id,
        title,
        body,
        data: { 
          alarmId: alarm.id,
          audioPath: alarm.audioPath,
          label: alarm.label
        },
        trigger: { 
          date: nextAlarmDate,
          channelId: 'alarms' 
        },
        sound: true,
      });
      
      console.log('Successfully scheduled alarm notification with ID:', identifier);
      return true;
    } catch (error) {
      console.error('Failed to schedule alarm notification:', error);
      return false;
    }
  }, [hasPermission, requestPermission, scheduleNotification, cancelNotification]);

  const cancelAlarmNotification = useCallback(async (alarmId: string) => {
    if (Platform.OS === 'web') {
      return;
    }
    
    try {
      await cancelNotification(alarmId);
      console.log('Cancelled notification for alarm ID:', alarmId);
    } catch (error) {
      console.error('Failed to cancel alarm notification:', error);
    }
  }, [cancelNotification]);

  // Add this function to handle updating all alarms at once
  const scheduleAllAlarms = useCallback(async (alarms: Alarm[]) => {
    if (Platform.OS === 'web') {
      return;
    }
    
    const activeAlarms = alarms.filter(alarm => alarm.isActive);
    
    for (const alarm of activeAlarms) {
      await scheduleAlarmNotification(alarm);
    }
    
    console.log(`Scheduled ${activeAlarms.length} active alarms`);
  }, [scheduleAlarmNotification]);

  return {
    hasPermission,
    requestPermission,
    scheduleAlarmNotification,
    cancelAlarmNotification,
    scheduleAllAlarms
  };
}