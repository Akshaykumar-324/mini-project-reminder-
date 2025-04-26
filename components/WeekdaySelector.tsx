import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

type WeekdaySelectorProps = {
  selected: boolean[];
  onChange: (days: boolean[]) => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function WeekdaySelector({ selected, onChange }: WeekdaySelectorProps) {
  const toggleDay = (index: number) => {
    const newSelected = [...selected];
    newSelected[index] = !newSelected[index];
    onChange(newSelected);
  };

  return (
    <View style={styles.container}>
      {WEEKDAYS.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            selected[index] && styles.selectedDay
          ]}
          onPress={() => toggleDay(index)}
        >
          <Text style={[
            styles.dayText,
            selected[index] && styles.selectedDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedDay: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  selectedDayText: {
    color: '#fff',
  },
});