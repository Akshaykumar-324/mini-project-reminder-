import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '@/types/alarm';

type AlarmContextType = {
  alarms: Alarm[];
  setAlarms: (alarms: Alarm[]) => void;
  isLoading: boolean;
  refreshAlarms: () => Promise<void>;
};

export const AlarmContext = createContext<AlarmContextType>({
  alarms: [],
  setAlarms: () => {},
  isLoading: false,
  refreshAlarms: async () => {},
});

type AlarmProviderProps = {
  children: ReactNode;
};

export default function AlarmProvider({ children }: AlarmProviderProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlarms = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedAlarms = await AsyncStorage.getItem('alarms');
      
      if (storedAlarms) {
        setAlarms(JSON.parse(storedAlarms));
      }
    } catch (error) {
      console.error('Failed to load alarms from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAlarmsToStorage = useCallback(async (updatedAlarms: Alarm[]) => {
    try {
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Failed to save alarms to storage:', error);
    }
  }, []);

  const handleSetAlarms = useCallback((updatedAlarms: Alarm[]) => {
    setAlarms(updatedAlarms);
    saveAlarmsToStorage(updatedAlarms);
  }, [saveAlarmsToStorage]);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        setAlarms: handleSetAlarms,
        isLoading,
        refreshAlarms: loadAlarms,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}