import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, 
  Linking, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/ui/Icons';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function EbookScreen({ onOpenPdf }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEbook, setEditingEbook] = useState(null); // If null, we are uploading
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'chandanprajapati6307@gmail.com';

  const txt1 = theme?.text?.primary || '#FFFFFF';
  const txtM = theme?.text?.muted || 'rgba(255,255,255,0.6)';
  const accent = theme?.accent?.primary || '#7B6FFF';
  const bg = theme?.bg?.base || '#08090F';
  const cardBg = theme?.bg?.card || '#1C1D26';
  const border = theme?.glass?.border || 'rgba(255,255,255,0.1)';

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const res = await api.get('/api/ebooks');
      setEbooks(res.data);
    } catch (e) {
      console.error('Failed to fetch ebooks', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const file = result.assets[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.pdf$/i, ''));
    } catch (e) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter a title');
    
    setProcessing(true);
    try {
      if (editingEbook) {
        // UPDATE
        await api.put(`/api/ebooks/${editingEbook.id}`, { title, description });
        Alert.alert('Success', 'Ebook updated successfully');
      } else {
        // UPLOAD
        if (!selectedFile) {
          setProcessing(false);
          return Alert.alert('Error', 'Please select a PDF file');
        }

        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/pdf',
        });
        formData.append('title', title);
        formData.append('description', description);

        await api.post('/api/ebooks/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Ebook uploaded successfully');
      }
      
      closeModal();
      fetchEbooks();
    } catch (e) {
      console.error('Operation failed', e);
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
    setTitle(ebook.title);
    setDescription(ebook.description || '');
    setSelectedFile(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEbook(null);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
  };

  const openEbook = (url, title) => {
    if (onOpenPdf) {
      onOpenPdf(url, title);
    } else {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open this eBook'));
    }
  };

  const renderEbook = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        <TouchableOpacity 
          style={styles.cardMain}
          onPress={() => openEbook(item.fileUrl, item.title)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: accent + '15' }]}>
            <Icon name="book" size={28} color={accent} />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={[styles.title, { color: txt1 }]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={[styles.desc, { color: txtM }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <Text style={[styles.date, { color: txtM }]}>
              {new Date(item.uploadedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </TouchableOpacity>

        {isAdmin && (
          <View style={[styles.adminActions, { borderTopColor: border }]}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => openEditModal(item)}
            >
              <Icon name="edit" size={16} color={accent} />
              <Text style={[styles.actionText, { color: accent }]}>Edit</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: border }]} />
            
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => handleDelete(item.id)}
            >
              <Icon name="trash" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
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
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: txt1 }]}>Library</Text>
          <Text style={[styles.headerSub, { color: txtM }]}>Premium Knowledge Vault</Text>
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
          <View style={[styles.emptyIconBox, { backgroundColor: cardBg }]}>
            <Icon name="book" size={48} color={txtM} />
          </View>
          <Text style={[styles.emptyTitle, { color: txt1 }]}>Library is Empty</Text>
          <Text style={[styles.emptyText, { color: txtM }]}>No premium eBooks have been uploaded yet.</Text>
        </View>
      ) : (
        <FlatList
          data={ebooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEbook}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
              <Text style={[styles.label, { color: txtM }]}>Book Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: txt1, borderColor: border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter book title..."
                placeholderTextColor={txtM}
              />

              <Text style={[styles.label, { color: txtM }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: bg, color: txt1, borderColor: border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Briefly describe the contents..."
                placeholderTextColor={txtM}
                multiline
                numberOfLines={4}
              />

              {!editingEbook && (
                <>
                  <Text style={[styles.label, { color: txtM }]}>PDF File</Text>
                  <TouchableOpacity 
                    style={[styles.filePicker, { backgroundColor: bg, borderColor: selectedFile ? accent : border, borderStyle: selectedFile ? 'solid' : 'dashed' }]}
                    onPress={handlePickFile}
                  >
                    <Icon name={selectedFile ? "check" : "upload"} size={24} color={selectedFile ? "#22C55E" : accent} />
                    <Text style={[styles.filePickerText, { color: selectedFile ? txt1 : txtM }]}>
                      {selectedFile ? selectedFile.name : 'Select PDF Document'}
                    </Text>
                  </TouchableOpacity>
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
  container: { flex: 1 , marginTop:-45},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.lg,
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
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardMain: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  iconBox: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: FONTS.displayMedium, fontSize: 17, marginBottom: 4 },
  desc: { fontFamily: FONTS.body, fontSize: 13, marginBottom: 8, lineHeight: 18 },
  date: { fontFamily: FONTS.body, fontSize: 11, opacity: 0.8 },
  adminActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { fontFamily: FONTS.bodyMedium, fontSize: 13 },
  divider: { width: 1, height: '60%', alignSelf: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  emptyTitle: { fontFamily: FONTS.displayMedium, fontSize: 20 },
  emptyText: { fontFamily: FONTS.body, fontSize: 15, textAlign: 'center', opacity: 0.7 },
  
  // Modal Styles
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
    height: 100,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  filePickerText: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#FFF', fontFamily: FONTS.displayBold, fontSize: 16 },
});
