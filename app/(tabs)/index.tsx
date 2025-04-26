import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AlarmItem from '@/components/AlarmItem';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { useAlarms } from '@/hooks/useAlarms';

export default function AlarmsScreen() {
  const { alarms, refreshAlarms, isLoading, toggleAlarm, deleteAlarm } = useAlarms();

  useFocusEffect(
    useCallback(() => {
      refreshAlarms();
    }, [refreshAlarms])
  );

  return (
    <View style={styles.container}>
      <Header title="My Alarms" />
      
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlarmItem 
            alarm={item} 
            onToggle={toggleAlarm}
            onDelete={deleteAlarm}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState 
            title="No alarms yet"
            message="Create your first alarm with a custom audio message."
            icon="bell-off"
          />
        }
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refreshAlarms} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
});