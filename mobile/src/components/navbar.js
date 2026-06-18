import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Navbar = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View style={styles.navbar}>
      <View style={styles.brand}>
        <Ionicons name="business" size={20} color="#fff" />
        <Text style={styles.brandText}>MARKCAMP</Text>
      </View>

      <TouchableOpacity style={styles.userArea} onPress={() => setShowDropdown(true)}>
        <Ionicons name="person-circle" size={24} color="#fff" />
        <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
      </TouchableOpacity>

      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.email}>{user?.email || ''}</Text>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.logoutBtn} onPress={() => { setShowDropdown(false); onLogout(); }}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  userArea: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#fff', fontSize: 14, marginLeft: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  dropdown: { backgroundColor: '#fff', marginTop: 60, marginRight: 16, borderRadius: 8, padding: 12, width: 200, elevation: 5 },
  email: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 6 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  logoutText: { color: '#ef4444', marginLeft: 6, fontWeight: '600', fontSize: 14 },
});

export default Navbar;