import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';

export default function EditAlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    return <Redirect href="/" />;
  }
  
  return <Redirect href={`/create?id=${id}`} />;
}