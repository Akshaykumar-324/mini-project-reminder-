import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type TimePickerProps = {
  value: { 
    hours: number;
    minutes: number;
    period: 'AM' | 'PM';
  };
  onChange: (value: { hours: number; minutes: number; period: 'AM' | 'PM' }) => void;
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const hourScale = useSharedValue(1);
  const minuteScale = useSharedValue(1);
  
  const hourStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: hourScale.value }],
    };
  });
  
  const minuteStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: minuteScale.value }],
    };
  });

  const increaseHour = () => {
    hourScale.value = withTiming(1.1, { duration: 100 }, () => {
      hourScale.value = withTiming(1);
    });
    
    let newHours = value.hours + 1;
    if (newHours > 12) newHours = 1;
    onChange({ ...value, hours: newHours });
  };

  const decreaseHour = () => {
    hourScale.value = withTiming(1.1, { duration: 100 }, () => {
      hourScale.value = withTiming(1);
    });
    
    let newHours = value.hours - 1;
    if (newHours < 1) newHours = 12;
    onChange({ ...value, hours: newHours });
  };

  const increaseMinute = () => {
    minuteScale.value = withTiming(1.1, { duration: 100 }, () => {
      minuteScale.value = withTiming(1);
    });
    
    let newMinutes = value.minutes + 1;
    if (newMinutes >= 60) newMinutes = 0;
    onChange({ ...value, minutes: newMinutes });
  };

  const decreaseMinute = () => {
    minuteScale.value = withTiming(1.1, { duration: 100 }, () => {
      minuteScale.value = withTiming(1);
    });
    
    let newMinutes = value.minutes - 1;
    if (newMinutes < 0) newMinutes = 59;
    onChange({ ...value, minutes: newMinutes });
  };

  const togglePeriod = () => {
    const newPeriod = value.period === 'AM' ? 'PM' : 'AM';
    onChange({ ...value, period: newPeriod });
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={increaseHour}
          >
            <ChevronUp size={24} color="#64748b" />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.timeText, hourStyle]}>
            {value.hours.toString().padStart(2, '0')}
          </Animated.Text>
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={decreaseHour}
          >
            <ChevronDown size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.separator}>:</Text>
        
        <View style={styles.unitContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={increaseMinute}
          >
            <ChevronUp size={24} color="#64748b" />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.timeText, minuteStyle]}>
            {value.minutes.toString().padStart(2, '0')}
          </Animated.Text>
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={decreaseMinute}
          >
            <ChevronDown size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.periodButton}
          onPress={togglePeriod}
        >
          <Text style={styles.periodText}>{value.period}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unitContainer: {
    alignItems: 'center',
    width: 60,
  },
  timeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1f2937',
    marginVertical: 8,
  },
  separator: {
    fontSize: 40,
    fontWeight: '600',
    color: '#6b7280',
    marginHorizontal: 8,
  },
  arrowButton: {
    padding: 8,
  },
  periodButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 16,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});