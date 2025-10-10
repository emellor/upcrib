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
import { RouteProp } from '@react-navigation/native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';

type MoodDetailNavigationProp = StackNavigationProp<any, 'MoodDetail'>;
type MoodDetailRouteProp = RouteProp<any, 'MoodDetail'>;

interface MoodDetailProps {
  navigation: MoodDetailNavigationProp;
  route: MoodDetailRouteProp;
}

interface MoodBoard {
  id: string;
  name: string;
  photos: string[];
  createdAt: Date;
}

const MoodDetailScreen: React.FC<MoodDetailProps> = ({ navigation, route }) => {
  const { moodBoard: initialMoodBoard } = route.params as { moodBoard: MoodBoard };
  const [moodBoard, setMoodBoard] = useState<MoodBoard>(initialMoodBoard);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editedName, setEditedName] = useState(moodBoard.name);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const maxPhotos = 8;
  const canAddMore = moodBoard.photos.length < maxPhotos;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      setMoodBoard({ ...moodBoard, name: editedName.trim() });
      setShowNameEdit(false);
    }
  };

  const handleImagePicker = (useCamera: boolean) => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as PhotoQuality,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        const newPhoto = response.assets[0].uri;
        setMoodBoard({
          ...moodBoard,
          photos: [...moodBoard.photos, newPhoto],
        });
      }
    };

    if (useCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
    
    setShowImagePicker(false);
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = moodBoard.photos.filter((_, i) => i !== index);
            setMoodBoard({ ...moodBoard, photos: newPhotos });
          },
        },
      ]
    );
  };

  const renderPhotoGrid = () => {
    const slots = Array.from({ length: maxPhotos });
    
    return (
      <View style={styles.photoGrid}>
        {slots.map((_, index) => {
          const hasPhoto = index < moodBoard.photos.length;
          const isAddSlot = index === moodBoard.photos.length && canAddMore;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.photoSlot}
              onPress={() => {
                if (hasPhoto) {
                  handleRemovePhoto(index);
                } else if (isAddSlot) {
                  setShowImagePicker(true);
                }
              }}
              disabled={!hasPhoto && !isAddSlot}
            >
              {hasPhoto ? (
                <>
                  <Image 
                    source={{ uri: moodBoard.photos[index] }} 
                    style={styles.photoImage}
                  />
                  <View style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </View>
                </>
              ) : isAddSlot ? (
                <View style={styles.addPhotoSlot}>
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </View>
              ) : (
                <View style={styles.emptyPhotoSlot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
        <View style={styles.headerCenter}>
          <TouchableOpacity onPress={() => setShowNameEdit(true)}>
            <Text style={styles.headerTitle}>{moodBoard.name}</Text>
            <Text style={styles.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.photoCounter}>
            {moodBoard.photos.length}/{maxPhotos}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Photos</Text>
        
        {renderPhotoGrid()}
        
        {canAddMore && (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Text style={styles.addMoreButtonText}>+ Add More Photos</Text>
          </TouchableOpacity>
        )}
        
        {moodBoard.photos.length === maxPhotos && (
          <View style={styles.limitReached}>
            <Text style={styles.limitText}>
              You've reached the maximum of {maxPhotos} photos for this mood board.
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showNameEdit}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNameEdit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Mood Board Name</Text>
            
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus={true}
              maxLength={30}
              selectTextOnFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNameEdit(false);
                  setEditedName(moodBoard.name);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, !editedName.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveName}
                disabled={!editedName.trim()}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Add Photo</Text>
            
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleImagePicker(true)}
            >
              <Text style={styles.pickerOptionIcon}>📷</Text>
              <Text style={styles.pickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleImagePicker(false)}
            >
              <Text style={styles.pickerOptionIcon}>📁</Text>
              <Text style={styles.pickerOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  editHint: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  photoCounter: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  emptyPhotoSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  addMoreButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  addMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  limitReached: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  limitText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 12,
  },
  pickerOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  pickerCancel: {
    paddingVertical: 16,
    marginTop: 12,
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MoodDetailScreen;
