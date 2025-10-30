import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Theme } from '../constants/theme';
import { DesignHistoryItem, HistoryStorageService } from '../services/historyStorage';
import BottomNavigation from '../components/BottomNavigation';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface HistoryScreenProps {
  navigation: HistoryScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const HistoryScreenNew: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DesignHistoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-refresh every 2 seconds to catch new items and status updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadHistory(true); // Silent refresh
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Load history data
  const loadHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      console.log('📚 [HistoryScreen] Loading history...');
      const designs = await HistoryStorageService.getDesignHistory();
      console.log('📚 [HistoryScreen] Loaded', designs.length, 'designs');
      setHistory(designs);
    } catch (error) {
      console.error('❌ [HistoryScreen] Error loading history:', error);
      Alert.alert('Error', 'Failed to load design history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [HistoryScreen] Screen focused - refreshing');
      loadHistory(true);
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // Clear all history
  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all designs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryStorageService.clearDesignHistory();
              setHistory([]);
              Alert.alert('Success', 'History cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  // Handle item press - show modal
  const handleItemPress = (item: DesignHistoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Render single history item
  const renderHistoryItem = ({ item }: { item: DesignHistoryItem }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleItemPress(item)}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design History</Text>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your completed design projects will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Before/After Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedItem?.title || 'Design Result'}
            </Text>
            <View style={styles.closeButton} />
          </View>

          {/* Before/After Images */}
          {selectedItem && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Status Badge */}
              <View style={[styles.modalStatusBadge, styles[`status_${selectedItem.status}`]]}>
                <Text style={styles.modalStatusText}>{selectedItem.status}</Text>
              </View>

              {/* Before Image */}
              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>BEFORE</Text>
                <Image
                  source={{ uri: selectedItem.originalImage || selectedItem.thumbnail }}
                  style={styles.modalImage}
                  resizeMode="contain"
                  onError={() => console.log('Failed to load before image')}
                />
              </View>

              {/* After Image (if completed) */}
              {selectedItem.status === 'completed' && selectedItem.generatedImage && (
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>AFTER</Text>
                  <Image
                    source={{ uri: selectedItem.generatedImage }}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onError={() => console.log('Failed to load after image')}
                  />
                </View>
              )}

              {/* Show message if still generating */}
              {selectedItem.status === 'generating' && (
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>AFTER</Text>
                  <View style={[styles.modalImage, styles.generatingPlaceholder]}>
                    <Text style={styles.generatingText}>🎨</Text>
                    <Text style={styles.generatingText}>Generating...</Text>
                  </View>
                </View>
              )}

              {/* Details */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {selectedItem.styleData && (
                  <>
                    <Text style={styles.detailLabel}>Style</Text>
                    <Text style={styles.detailValue}>
                      {selectedItem.styleData.architecturalStyle || 'N/A'}
                    </Text>

                    <Text style={styles.detailLabel}>Color Palette</Text>
                    <Text style={styles.detailValue}>
                      {selectedItem.styleData.colorPalette || 'N/A'}
                    </Text>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <BottomNavigation activeTab="History" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: Theme.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  clearButton: {
    padding: Theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  list: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.xs,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  status_generating: {
    backgroundColor: '#FFF3CD',
  },
  status_completed: {
    backgroundColor: '#D1E7DD',
  },
  status_failed: {
    backgroundColor: '#F8D7DA',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
  },
  modalStatusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: Theme.spacing.xl,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    letterSpacing: 1,
  },
  modalImage: {
    width: width - (Theme.spacing.md * 2),
    height: 300,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignSelf: 'center',
  },
  generatingPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 4,
  },
  detailsSection: {
    paddingVertical: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginBottom: Theme.spacing.xl,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: Theme.spacing.md,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
});

export default HistoryScreenNew;