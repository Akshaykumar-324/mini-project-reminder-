import { useState, useCallback, useContext, useEffect } from 'react';
import { AlarmContext } from '@/providers/AlarmProvider';
import { Alarm } from '@/types/alarm';
import { useNotifications } from './useNotifications';
import { useAlarmSound } from './useAlarmSound';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAlarms() {
  const { 
    alarms,
    setAlarms,
    isLoading,
    refreshAlarms: refresh
  } = useContext(AlarmContext);
  
  const { scheduleAlarmNotification, cancelAlarmNotification } = useNotifications();
  const { playAlarmSound, stopAlarmSound } = useAlarmSound();
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);

  useEffect(() => {
    loadSnoozeTime();
  }, []);

  const loadSnoozeTime = async () => {
    const savedTime = await AsyncStorage.getItem('snoozeTime');
    if (savedTime) {
      setSnoozeMinutes(parseInt(savedTime, 10));
    }
  };

  const snoozeAlarm = async (alarm: Partial<Alarm>) => {
    const now = new Date();
    const snoozeTime = new Date(now.getTime() + snoozeMinutes * 60000);
    
    await stopAlarmSound();
    
    const fullAlarm = alarms.find(a => a.id === alarm.id);
    if (fullAlarm) {
      // Schedule a new notification for the snoozed time
      await scheduleAlarmNotification({
        ...fullAlarm,
        isSnooze: true,
        snoozeTime,
      });
    }
  };

  const handleAlarmTrigger = async (alarm: Partial<Alarm>) => {
    const fullAlarm = alarms.find(a => a.id === alarm.id);
    if (fullAlarm?.audioPath) {
      await playAlarmSound(fullAlarm.audioPath);
    }
  };

  const dismissAlarm = async () => {
    await stopAlarmSound();
  };

  const refreshAlarms = useCallback(() => {
    refresh();
  }, [refresh]);

  const getAlarm = useCallback((id: string) => {
    return alarms.find(alarm => alarm.id === id) || null;
  }, [alarms]);

  const saveAlarm = useCallback(async (alarm: Partial<Alarm> & { id: string }) => {
    const isNew = !alarms.some(a => a.id === alarm.id);
    let updatedAlarms: Alarm[];
    
    if (isNew) {
      const newAlarm = {
        id: alarm.id,
        hours: alarm.hours || 8,
        minutes: alarm.minutes || 0,
        period: alarm.period || 'AM',
        days: alarm.days || [true, true, true, true, true, true, true],
        audioPath: alarm.audioPath || '',
        label: alarm.label || '',
        isActive: alarm.isActive !== undefined ? alarm.isActive : true,
        createdAt: alarm.createdAt || new Date().toISOString(),
      };
      
      updatedAlarms = [...alarms, newAlarm];
      
      if (newAlarm.isActive) {
        await scheduleAlarmNotification(newAlarm);
      }
    } else {
      updatedAlarms = alarms.map(a => {
        if (a.id === alarm.id) {
          const updatedAlarm = { ...a, ...alarm };
          
          if (updatedAlarm.isActive) {
            scheduleAlarmNotification(updatedAlarm);
          } else {
            cancelAlarmNotification(updatedAlarm.id);
          }
          
          return updatedAlarm;
        }
        return a;
      });
    }
    
    setAlarms(updatedAlarms);
  }, [alarms, setAlarms, scheduleAlarmNotification, cancelAlarmNotification]);

  const toggleAlarm = useCallback(async (id: string, isActive: boolean) => {
    const updatedAlarms = alarms.map(alarm => {
      if (alarm.id === id) {
        const updatedAlarm = { ...alarm, isActive };
        
        if (isActive) {
          scheduleAlarmNotification(updatedAlarm);
        } else {
          cancelAlarmNotification(id);
        }
        
        return updatedAlarm;
      }
      return alarm;
    });
    
    setAlarms(updatedAlarms);
  }, [alarms, setAlarms, scheduleAlarmNotification, cancelAlarmNotification]);

  const deleteAlarm = useCallback(async (id: string) => {
    await cancelAlarmNotification(id);
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  }, [alarms, setAlarms, cancelAlarmNotification]);

  const clearAllAlarms = useCallback(async () => {
    for (const alarm of alarms) {
      await cancelAlarmNotification(alarm.id);
    }
    setAlarms([]);
  }, [alarms, setAlarms, cancelAlarmNotification]);

  return {
    alarms,
    isLoading,
    refreshAlarms,
    getAlarm,
    saveAlarm,
    toggleAlarm,
    deleteAlarm,
    clearAllAlarms,
    snoozeAlarm,
    dismissAlarm,
    handleAlarmTrigger,
    snoozeMinutes,
    setSnoozeMinutes: async (minutes: number) => {
      setSnoozeMinutes(minutes);
      await AsyncStorage.setItem('snoozeTime', minutes.toString());
    }
  };
}