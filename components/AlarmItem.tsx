import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Switch } from 'react-native';
import { CreditCard as Edit2, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Alarm } from '@/types/alarm';
//import { getWeekdayLabels } from '@/utils/timeUtils';
import { getWeekdayLabels } from '@/utils/timeUtils';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

type AlarmItemProps = {
  alarm: Alarm;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
};

export default function AlarmItem({ alarm, onToggle, onDelete }: AlarmItemProps) {
  const router = useRouter();
  const weekdayText = getWeekdayLabels();

  const handleDelete = () => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => onDelete(alarm.id),
          style: 'destructive'
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/create?id=${alarm.id}`);
  };

  return (
    <Animated.View 
      style={[styles.container, alarm.isActive ? styles.activeContainer : {}]}
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>
          {alarm.hours}:{alarm.minutes.toString().padStart(2, '0')}
          <Text style={styles.period}> {alarm.period}</Text>
        </Text>
        
        {alarm.label ? (
          <Text style={styles.label}>{alarm.label}</Text>
        ) : null}
        
        <Text style={styles.days}>{weekdayText}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleEdit}
        >
          <Edit2 size={18} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDelete}
        >
          <Trash2 size={18} color="#64748b" />
        </TouchableOpacity>
        
        <Switch
          value={alarm.isActive}
          onValueChange={(value) => onToggle(alarm.id, value)}
          trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
          thumbColor={alarm.isActive ? Colors.light.tint : '#9ca3af'}
          ios_backgroundColor="#d1d5db"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
  },
  activeContainer: {
    borderLeftColor: Colors.light.tint,
  },
  timeContainer: {
    flex: 1,
    paddingRight: 8,
  },
  time: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  period: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  days: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
});