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

import { useCallback, useContext } from 'react';
import { Platform } from 'react-native';
import { NotificationContext } from '@/providers/NotificationProvider';
import { Alarm } from '@/types/alarm';
import { getSecondsUntilNextAlarm } from '@/utils/timeUtils';

export function useNotifications() {
  const {
    hasPermission,
    requestPermission,
    scheduleNotification,
    cancelNotification
  } = useContext(NotificationContext);

  const scheduleAlarmNotification = useCallback(async (alarm: Alarm) => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    if (!alarm.isActive) return false;

    try {
      await cancelNotification(alarm.id);

      const nextAlarmTime = getNextAlarmTime(alarm);
      if (!nextAlarmTime || nextAlarmTime <= new Date()) return false;

      // Calculate seconds until alarm (as backup)
      const secondsUntilAlarm = Math.max(
        Math.floor((nextAlarmTime.getTime() - Date.now()) / 1000),
        30 // Minimum 30-second buffer
      );

      console.log(`Scheduling for ${nextAlarmTime.toISOString()} (${secondsUntilAlarm}s)`);

      const identifier = await scheduleNotification({
        identifier: alarm.id,
        title: alarm.label || 'Alarm',
        body: 'Your custom alarm is going off!',
        sound: true,
        data: {
          alarmId: alarm.id,
          audioPath: alarm.audioPath,
          isAlarmNotification: true,
        },
        trigger: {
          date: nextAlarmTime, // Pass date directly
          type: 'date',
        }
      });

      console.log('Scheduled successfully:', identifier);
      return true;
    } catch (error) {
      console.error('Scheduling failed:', error);
      return false;
    }
  }, [hasPermission, requestPermission, scheduleNotification, cancelNotification]);

  const getNextAlarmTime = (alarm: Alarm): Date | null => {
    if (!alarm?.days?.some(day => day)) return null;

    // Convert to 24-hour format
    let hour = alarm.hours;
    if (alarm.period === 'PM' && hour < 12) hour += 12;
    if (alarm.period === 'AM' && hour === 12) hour = 0;

    const now = new Date();
    const currentDay = now.getDay();

    // Check next 7 days
    for (let offset = 0; offset < 7; offset++) {
      const checkDayIndex = (currentDay + offset) % 7;

      if (alarm.days[checkDayIndex]) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + offset);
        targetDate.setHours(hour, alarm.minutes, 0, 0);

        // 30-second minimum buffer
        if (targetDate.getTime() > now.getTime() + 30000) {
          return targetDate;
        }
      }
    }

    return null;
  };

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