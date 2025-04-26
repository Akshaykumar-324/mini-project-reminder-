import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
};

export default function Header({ title, showBackButton = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={24} color="#1f2937" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightContainer}>
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 16,
  },
  leftContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  rightContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  backButton: {
    padding: 4,
  },
});