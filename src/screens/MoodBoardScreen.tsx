import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchImageLibrary, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import BottomNavigation from '../components/BottomNavigation';

type MoodBoardNavigationProp = StackNavigationProp<any, 'MoodBoard'>;

interface MoodBoardProps {
  navigation: MoodBoardNavigationProp;
}

interface MoodBoard {
  id: string;
  name: string;
  photos: string[];
  createdAt: Date;
}

const MoodBoardScreen: React.FC<MoodBoardProps> = ({ navigation }) => {
  const [moodBoards, setMoodBoards] = useState<MoodBoard[]>([
    {
      id: '1',
      name: 'Modern Minimalist',
      photos: [], // Would contain actual image URIs
      createdAt: new Date(),
    },
    {
      id: '2', 
      name: 'Cozy Scandinavian',
      photos: [],
      createdAt: new Date(),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMoodName, setNewMoodName] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateMood = () => {
    if (newMoodName.trim()) {
      const newMood: MoodBoard = {
        id: Date.now().toString(),
        name: newMoodName.trim(),
        photos: [],
        createdAt: new Date(),
      };
      setMoodBoards([newMood, ...moodBoards]);
      setNewMoodName('');
      setShowCreateModal(false);
      
      // Navigate to the new mood detail screen
      navigation.navigate('MoodDetail', { moodBoard: newMood });
    }
  };

  const handleMoodPress = (moodBoard: MoodBoard) => {
    navigation.navigate('MoodDetail', { moodBoard });
  };

  const renderMoodCard = (moodBoard: MoodBoard) => {
    const photoCount = moodBoard.photos.length;
    const maxPhotos = 8;
    
    return (
      <TouchableOpacity
        key={moodBoard.id}
        style={styles.moodCard}
        onPress={() => handleMoodPress(moodBoard)}
      >
        <View style={styles.moodHeader}>
          <Text style={styles.moodName}>{moodBoard.name}</Text>
          <Text style={styles.photoCount}>{photoCount}/{maxPhotos}</Text>
        </View>
        
        <View style={styles.photoGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.photoSlot}>
              {moodBoard.photos[index] ? (
                <Image 
                  source={{ uri: moodBoard.photos[index] }} 
                  style={styles.photoImage}
                />
              ) : (
                <View style={styles.emptyPhotoSlot}>
                  {index === 0 && photoCount === 0 && (
                    <Text style={styles.emptyText}>+</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
        
        <Text style={styles.moodDate}>
          Created {moodBoard.createdAt.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ flex: 1 }}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Collections</Text>
        <Text style={styles.sectionSubtitle}>
          Create mood boards to collect inspiration photos. Each mood can hold up to 8 photos.
        </Text>

        {/* Mood Boards Grid */}
        <View style={styles.moodGrid}>
          {moodBoards.map(renderMoodCard)}
          
          {/* Add New Mood Card */}
          <TouchableOpacity
            style={styles.addMoodCard}
            onPress={() => setShowCreateModal(true)}
          >
            <View style={styles.addMoodContent}>
              <Text style={styles.addMoodIcon}>+</Text>
              <Text style={styles.addMoodText}>Create New Mood</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Mood Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Mood Board</Text>
            
            <TextInput
              style={styles.nameInput}
              placeholder="Enter mood board name..."
              value={newMoodName}
              onChangeText={setNewMoodName}
              autoFocus={true}
              maxLength={30}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewMoodName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, !newMoodName.trim() && styles.createButtonDisabled]}
                onPress={handleCreateMood}
                disabled={!newMoodName.trim()}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="MoodBoard" />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  headerLogo: {
    flex: 1,
    height: 40,
    alignSelf: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  photoCount: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  emptyPhotoSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  moodDate: {
    fontSize: 12,
    color: '#999999',
  },
  addMoodCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addMoodContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoodIcon: {
    fontSize: 32,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  addMoodText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  createButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MoodBoardScreen;
