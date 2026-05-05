import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, 
  Linking, Modal, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions,
  InteractionManager
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/ui/Icons';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function EbookScreen({ onOpenPdf }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null);
  const [selectedEnglishFile, setSelectedEnglishFile] = useState(null);
  const [selectedHindiFile, setSelectedHindiFile] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'chandanprajapati6307@gmail.com';

  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txt2 = theme?.text?.secondary || 'rgba(255,255,255,0.85)';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const bg = theme?.bg?.base || '#08090F';
  const cardBg = theme?.bg?.card || '#1C1D26';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';
  const gold = theme?.accent?.gold || '#FFD166';

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fetchEbooks();
    });
    return () => task.cancel();
  }, []);

  const fetchEbooks = async () => {
    try {
      const res = await api.get('/api/ebooks');
      setEbooks(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const handlePickEnglishFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setSelectedEnglishFile(result.assets[0]);
    } catch (e) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handlePickHindiFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setSelectedHindiFile(result.assets[0]);
    } catch (e) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handlePickCoverImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setSelectedCoverImage(result.assets[0]);
    } catch (e) {
      Alert.alert('Error', 'Failed to pick cover image');
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      if (editingEbook) {
        await api.put(`/api/ebooks/${editingEbook.id}`, {});
        Alert.alert('Success', 'Ebook updated successfully');
      } else {
        if (!selectedEnglishFile && !selectedHindiFile) {
          setProcessing(false);
          return Alert.alert('Error', 'Please select at least one PDF file (English or Hindi)');
        }
        const formData = new FormData();
        if (selectedEnglishFile) {
          formData.append('englishPdf', {
            uri: selectedEnglishFile.uri,
            name: selectedEnglishFile.name,
            type: selectedEnglishFile.mimeType || 'application/pdf',
          });
        }
        if (selectedHindiFile) {
          formData.append('hindiPdf', {
            uri: selectedHindiFile.uri,
            name: selectedHindiFile.name,
            type: selectedHindiFile.mimeType || 'application/pdf',
          });
        }
        if (selectedCoverImage) {
          formData.append('coverImage', {
            uri: selectedCoverImage.uri,
            name: selectedCoverImage.name,
            type: selectedCoverImage.mimeType || 'image/jpeg',
          });
        }
        await api.post('/api/ebooks/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Ebook uploaded successfully');
      }
      closeModal();
      fetchEbooks();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Ebook',
      'Are you sure you want to permanently delete this eBook?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/ebooks/${id}`);
              fetchEbooks();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete eBook');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (ebook) => {
    setEditingEbook(ebook);
    setSelectedEnglishFile(null);
    setSelectedHindiFile(null);
    setSelectedCoverImage(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEbook(null);
    setSelectedEnglishFile(null);
    setSelectedHindiFile(null);
    setSelectedCoverImage(null);
  };

  const openEbook = (url, ebookTitle) => {
    if (onOpenPdf) {
      onOpenPdf(url, ebookTitle);
    } else {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open this eBook'));
    }
  };

  // ── Premium Single-Column Book Card ──────────────
  const renderEbook = ({ item, index }) => {
    const accentColors = [accent, '#FF9F1C', '#4ECDC4', '#E879F9', '#22C55E'];
    const cardAccent = accentColors[index % accentColors.length];

    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        {/* Cover / Placeholder */}
        {item.coverImageUrl ? (
          <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <LinearGradient
            colors={[cardAccent + '25', cardAccent + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverPlaceholder}
          >
            <View style={[styles.coverIconWrap, { backgroundColor: cardAccent + '20' }]}>
              <Icon name="book-open" size={32} color={cardAccent} />
            </View>
          </LinearGradient>
        )}

        {/* Read Actions */}
        <View style={[styles.readBar, { borderTopColor: border }]}>
          {item.englishFileUrl && (
            <TouchableOpacity 
              style={styles.readBtn} 
              onPress={() => openEbook(item.englishFileUrl, item.title + " (English)")}
            >
              <Icon name="book" size={16} color={accent} />
              <Text style={[styles.readBtnText, { color: accent }]}>Read English</Text>
            </TouchableOpacity>
          )}
          
          {item.englishFileUrl && item.hindiFileUrl && (
            <View style={[styles.readDivider, { backgroundColor: border }]} />
          )}

          {item.hindiFileUrl && (
            <TouchableOpacity 
              style={styles.readBtn} 
              onPress={() => openEbook(item.hindiFileUrl, item.title + " (Hindi)")}
            >
              <Icon name="book" size={16} color={accent} />
              <Text style={[styles.readBtnText, { color: accent }]}>Read Hindi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Admin Actions */}
        {isAdmin && (
          <View style={[styles.adminBar, { borderTopColor: border }]}>
            <TouchableOpacity 
              style={styles.adminBtn} 
              onPress={() => openEditModal(item)}
            >
              <Icon name="edit" size={14} color={accent} />
              <Text style={[styles.adminBtnText, { color: accent }]}>Edit</Text>
            </TouchableOpacity>
            
            <View style={[styles.adminDivider, { backgroundColor: border }]} />
            
            <TouchableOpacity 
              style={styles.adminBtn} 
              onPress={() => handleDelete(item.id)}
            >
              <Icon name="trash" size={14} color="#EF4444" />
              <Text style={[styles.adminBtnText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: txt1 }]}>Library</Text>
          <Text style={[styles.headerSub, { color: txtM }]}>
            {ebooks.length > 0 ? `${ebooks.length} Books Available` : 'Premium Knowledge Vault'}
          </Text>
        </View>
        
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.uploadBtn, { backgroundColor: accent }]}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={18} color="#FFF" />
            <Text style={styles.uploadBtnText}>Add Book</Text>
          </TouchableOpacity>
        )}
      </View>

      {ebooks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconBox, { backgroundColor: cardBg, borderColor: border }]}>
            <Icon name="book" size={48} color={txtM} />
          </View>
          <Text style={[styles.emptyTitle, { color: txt1 }]}>Library is Empty</Text>
          <Text style={[styles.emptyText, { color: txtM }]}>No premium eBooks have been uploaded yet.</Text>
        </View>
      ) : (
        <FlatList
          key="single-col"
          data={ebooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEbook}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={3}
          maxToRenderPerBatch={3}
          removeClippedSubviews={true}
        />
      )}

      {/* ── Upload / Edit Modal ─────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: txt1 }]}>
                {editingEbook ? 'Edit Ebook' : 'Upload New Ebook'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Icon name="close" size={24} color={txtM} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {!editingEbook && (
                <>
                  <Text style={[styles.label, { color: txtM }]}>English PDF File</Text>
                  <TouchableOpacity 
                    style={[styles.filePicker, { backgroundColor: bg, borderColor: selectedEnglishFile ? accent : border, borderStyle: selectedEnglishFile ? 'solid' : 'dashed' }]}
                    onPress={handlePickEnglishFile}
                  >
                    <Icon name={selectedEnglishFile ? "check" : "upload"} size={24} color={selectedEnglishFile ? "#22C55E" : accent} />
                    <Text style={[styles.filePickerText, { color: selectedEnglishFile ? txt1 : txtM }]}>
                      {selectedEnglishFile ? selectedEnglishFile.name : 'Select English PDF Document'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: txtM }]}>Hindi PDF File</Text>
                  <TouchableOpacity 
                    style={[styles.filePicker, { backgroundColor: bg, borderColor: selectedHindiFile ? accent : border, borderStyle: selectedHindiFile ? 'solid' : 'dashed' }]}
                    onPress={handlePickHindiFile}
                  >
                    <Icon name={selectedHindiFile ? "check" : "upload"} size={24} color={selectedHindiFile ? "#22C55E" : accent} />
                    <Text style={[styles.filePickerText, { color: selectedHindiFile ? txt1 : txtM }]}>
                      {selectedHindiFile ? selectedHindiFile.name : 'Select Hindi PDF Document'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.label, { color: txtM }]}>Cover Image (Optional)</Text>
                  {selectedCoverImage ? (
                    <TouchableOpacity onPress={handlePickCoverImage} activeOpacity={0.85}>
                      <Image 
                        source={{ uri: selectedCoverImage.uri }} 
                        style={[styles.coverPreview, { borderColor: accent }]} 
                      />
                      <View style={[styles.coverPreviewOverlay, { backgroundColor: accent + '22' }]}>
                        <Icon name="edit" size={16} color={accent} />
                        <Text style={[styles.coverPreviewText, { color: accent }]}>Tap to change</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.filePicker, { backgroundColor: bg, borderColor: border, borderStyle: 'dashed' }]}
                      onPress={handlePickCoverImage}
                    >
                      <Icon name="image" size={24} color={accent} />
                      <Text style={[styles.filePickerText, { color: txtM }]}>Select Cover Image</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: accent }]}
                onPress={handleSubmit}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingEbook ? 'Save Changes' : 'Start Upload'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: -45 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.md,
  },
  headerTitle: { fontFamily: FONTS.display, fontSize: 32 },
  headerSub: { fontFamily: FONTS.body, fontSize: 13, marginTop: -2 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadBtnText: { color: '#FFF', fontFamily: FONTS.displayMedium, fontSize: 14 },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 120 },

  // ── Premium Single-Column Card ────────────────
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  coverImage: {
    width: '100%',
    height: 380,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Read Actions ─────────────────────────────
  readBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  readBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  readBtnText: { fontFamily: FONTS.displayMedium, fontSize: 14 },
  readDivider: { width: 1, height: '60%', alignSelf: 'center' },

  // ── Admin Actions ─────────────────────────────
  adminBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  adminBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  adminDivider: { width: 1, height: '60%', alignSelf: 'center' },

  // ── Empty State ───────────────────────────────
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  emptyTitle: { fontFamily: FONTS.displayMedium, fontSize: 20 },
  emptyText: { fontFamily: FONTS.body, fontSize: 15, textAlign: 'center', opacity: 0.7 },
  
  // ── Modal Styles ──────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: FONTS.display, fontSize: 22 },
  label: { fontFamily: FONTS.bodyMedium, fontSize: 14, marginBottom: 8, marginLeft: 4 },
  input: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 14,
    fontFamily: FONTS.body,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  filePicker: {
    height: 90,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  filePickerText: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#FFF', fontFamily: FONTS.displayBold, fontSize: 16 },

  // ── Cover Image Crop Preview ──────────────
  coverPreview: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  coverPreviewOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginBottom: 20,
  },
  coverPreviewText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
});
