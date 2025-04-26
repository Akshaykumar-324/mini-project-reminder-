import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/Colors';

type AlarmNotificationProps = {
  title: string;
  onSnooze: () => void;
  onDismiss: () => void;
};

export default function AlarmNotification({ 
  title, 
  onSnooze, 
  onDismiss 
}: AlarmNotificationProps) {
  const { isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }
    ]}>
      <Text style={[
        styles.title,
        { color: isDark ? Colors.dark.text : Colors.light.text }
      ]}>
        {title}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.snoozeButton]}
          onPress={onSnooze}
        >
          <Text style={styles.buttonText}>Snooze</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  snoozeButton: {
    backgroundColor: Colors.light.tint,
  },
  dismissButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});