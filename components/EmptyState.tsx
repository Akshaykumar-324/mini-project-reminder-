import { View, Text, StyleSheet } from 'react-native';
import { Bell, BellOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: 'bell' | 'bell-off' | 'alert';
};

export default function EmptyState({ title, message, icon = 'bell' }: EmptyStateProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'bell':
        return <Bell size={64} color="#d1d5db" />;
      case 'bell-off':
        return <BellOff size={64} color="#d1d5db" />;
      case 'alert':
        return <AlertCircle size={64} color="#d1d5db" />;
      default:
        return <Bell size={64} color="#d1d5db" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 300,
  },
});