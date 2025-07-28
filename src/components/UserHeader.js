/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserHeader = ({
  userProfile,
  userDisplayName,
  onNavigateToProfile,
  onNotificationPress,
  onSettingsPress,
}) => {
  // Assurez-vous que userDisplayName n'est pas null/undefined avant d'appeler charAt
  const displayChar = userDisplayName ? userDisplayName.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.userInfo} onPress={onNavigateToProfile}>
        {userProfile?.photoURL ? (
          <Image source={{ uri: userProfile.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{displayChar}</Text>
          </View>
        )}
        <View>
          <Text style={{ color:'#fff' }}>Bonjour,</Text>
          <Text style={styles.userName}>{userDisplayName || 'Utilisateur'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Icon name="bell" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Icon name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ADD8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default UserHeader;