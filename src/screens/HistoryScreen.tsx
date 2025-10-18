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
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Theme } from '../constants/theme';
import GlobalStyles from '../constants/globalStyles';
import BottomNavigation from '../components/BottomNavigation';
import { useHistory } from '../hooks/useHistory';
import { DesignHistoryItem, HistoryStorageService } from '../services/historyStorage';
import ResultScreen from './ResultScreen';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface HistoryScreenProps {
  navigation: HistoryScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const ITEM_SPACING = 8;
const ITEMS_PER_ROW = 3;
const ITEM_WIDTH = (width - (Theme.spacing.lg * 2) - (ITEM_SPACING * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { history, loading, error, deleteDesign, clearHistory, updateDesignTitle, refreshHistory } = useHistory();
  const [selectedItem, setSelectedItem] = useState<DesignHistoryItem | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState<{
    sessionId: string;
    imageUrl?: string;
    originalImageUrl?: string;
  } | null>(null);

  // Auto-refresh when there are generating designs
  useEffect(() => {
    const hasGenerating = history.some(item => item.status === 'generating');
    
    if (hasGenerating) {
      const interval = setInterval(() => {
        refreshHistory(true); // Silent refresh - no loading indicator
      }, 3000); // Check every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [history]); // Remove refreshHistory from deps - it's stable from useCallback

  const handleBack = () => {
    console.log('Navigating back from HistoryScreen');
    navigation.goBack();
  };

  const handleItemPress = (item: DesignHistoryItem) => {
    // Always use the HTTP URLs (thumbnail and originalImage) for displaying in ResultScreen
    // The file:// paths are only for local thumbnails in the grid view
    
    // Open Result screen as modal
    setResultModalData({
      sessionId: item.sessionId,
      imageUrl: item.thumbnail,  // HTTP URL for the generated image
      originalImageUrl: item.originalImage,  // HTTP URL for the original image
    });
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setResultModalData(null);
    // Refresh history to catch any updates
    refreshHistory(true);
  };

  const handleItemLongPress = (item: DesignHistoryItem) => {
    setSelectedItem(item);
    setShowOptionsModal(true);
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    Alert.alert(
      'Delete Design',
      'Are you sure you want to delete this design from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDesign(selectedItem.sessionId);
              setShowOptionsModal(false);
              setSelectedItem(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete design');
            }
          },
        },
      ]
    );
  };

  const handleRenameItem = () => {
    if (!selectedItem) return;
    setNewTitle(selectedItem.title || '');
    setShowOptionsModal(false);
    setShowRenameModal(true);
  };

  const handleSaveRename = async () => {
    if (!selectedItem || !newTitle.trim()) return;
    
    try {
      await updateDesignTitle(selectedItem.sessionId, newTitle.trim());
      setShowRenameModal(false);
      setSelectedItem(null);
      setNewTitle('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update design title');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to clear all design history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Debug Info', 
          style: 'default',
          onPress: async () => {
            try {
              const storageInfo = await HistoryStorageService.getStorageInfo();
              Alert.alert('Storage Debug Info', JSON.stringify(storageInfo, null, 2));
            } catch (error) {
              Alert.alert('Debug Error', `Failed to get storage info: ${error}`);
            }
          }
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderHistoryItem = ({ item }: { item: DesignHistoryItem }) => {
    // Use local thumbnail path if available, otherwise use the original URL
    const thumbnailSource = item.localThumbnailPath 
      ? { uri: `file://${item.localThumbnailPath}` }
      : { uri: item.thumbnail };

    const isGenerating = item.status === 'generating';

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => !isGenerating && handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
        activeOpacity={isGenerating ? 1 : 0.7}
        disabled={isGenerating}
      >
        <View style={styles.imageContainer}>
          <Image
            source={thumbnailSource}
            style={[styles.thumbnailImage, isGenerating && styles.generatingImage]}
            resizeMode="cover"
          />
          {item.status === 'generating' && (
            <View style={styles.generatingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.generatingText}>Generating...</Text>
            </View>
          )}
          {item.status === 'failed' && (
            <View style={styles.failedOverlay}>
              <Text style={styles.failedText}>Failed</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title || `Design ${item.sessionId.slice(-6)}`}
          </Text>
          <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={GlobalStyles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={[GlobalStyles.backButton, { zIndex: 10 }]}
          activeOpacity={0.7}
        >
          <Text style={GlobalStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={[GlobalStyles.headerContent, { pointerEvents: 'none' }]}>
          <Image 
            source={require('../images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerSpacer} />
         <TouchableOpacity 
          onPress={handleClearHistory} 
          style={styles.clearButton}
          disabled={history.length === 0}
        >
          <Text style={[styles.clearButtonText, history.length === 0 && styles.clearButtonDisabled]}>
            Clear
          </Text>
        </TouchableOpacity> 
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={GlobalStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={GlobalStyles.loadingText}>Loading your designs...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={GlobalStyles.nextButton} onPress={() => refreshHistory()}>
              <Text style={GlobalStyles.nextButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyDescription}>
              Your completed design projects will appear here. Start your first renovation to see your design history.
            </Text>
            
            <TouchableOpacity 
              style={GlobalStyles.nextButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={GlobalStyles.nextButtonText}>Start New Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Design History</Text>
              <Text style={styles.sectionSubtitle}>
                {history.length} design{history.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.sessionId}
              numColumns={ITEMS_PER_ROW}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={() => refreshHistory()}
            />
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="History" />

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.modalTitle}>Design Options</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleRenameItem}>
              <Text style={styles.optionButtonText}>✏️ Rename</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleDeleteItem}>
              <Text style={[styles.optionButtonText, styles.deleteOptionText]}>🗑️ Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renameModal}>
            <Text style={styles.modalTitle}>Rename Design</Text>
            
            <TextInput
              style={styles.textInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter design name..."
              placeholderTextColor={Theme.colors.textTertiary}
              autoFocus={true}
              maxLength={50}
            />
            
            <View style={styles.renameActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRenameModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, !newTitle.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveRename}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseResultModal}
      >
        <View style={styles.modalContainer}>
          {resultModalData && (
            <ResultScreen
              navigation={navigation as any}
              route={{
                params: resultModalData,
                key: 'Result',
                name: 'Result' as const,
              } as any}
              onClose={handleCloseResultModal}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
  headerLogo: {
    height: 40,
    alignSelf: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  modalContainer: {
    flex: 1,
    marginTop: 115,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  clearButtonDisabled: {
    color: Theme.colors.textTertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  errorText: {
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.error,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSizes['2xl'],
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
  },
  gridContainer: {
    paddingBottom: Theme.spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: ITEM_SPACING,
  },
  historyItem: {
    width: ITEM_WIDTH,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.sm,
    marginBottom: Theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  generatingImage: {
    opacity: 0.5,
  },
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    marginTop: Theme.spacing.xs,
  },
  failedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedText: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.semibold as any,
  },
  itemInfo: {
    padding: Theme.spacing.sm,
  },
  itemTitle: {
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.medium as any,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.lg,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  emptyDescription: {
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeights.relaxed,
    marginBottom: Theme.spacing['2xl'],
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  optionsModal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '100%',
    maxWidth: 280,
  },
  renameModal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  optionButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.backgroundSecondary,
    marginBottom: Theme.spacing.sm,
  },
  optionButtonText: {
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  deleteOptionText: {
    color: Theme.colors.error,
  },
  cancelButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
  },
  cancelButtonText: {
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.surface,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeights.medium as any,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.backgroundSecondary,
    marginBottom: Theme.spacing.lg,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  saveButton: {
    ...Theme.buttons.primary,
    flex: 1,
    paddingVertical: Theme.spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Theme.buttons.primaryText,
    textAlign: 'center',
  },
});

export default HistoryScreen;
