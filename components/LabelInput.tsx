import { TextInput, StyleSheet, View } from 'react-native';
import { Tag } from 'lucide-react-native';
import Colors from '@/constants/Colors';

type LabelInputProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export default function LabelInput({ value, onChange, placeholder = 'Label' }: LabelInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Tag size={20} color="#64748b" />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={30}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    height: 50, // Reduced height
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 8, // Reduced padding
    fontSize: 16,
    color: '#1f2937',
  },
});