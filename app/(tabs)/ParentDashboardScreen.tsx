import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { getParentById } from '@/services/parentService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Define interfaces outside of the component
interface Competition {
  id: number;
  nom: string;
  date: string;
  lieu: string;
}

interface Parent {
  id: number;
  nom: string;
  prenom: string;
  dateInscriptionClub?: string;
  notifications?: number;
  adherents?: any[];
}

interface Adherent {
  id: number;
  nom: string;
  prenom: string;
  activites?: { 
    nom: string;
    competition?: Competition;
  }[];
  activities?: string[];
  progress?: number;
  nextSession?: string;
  age?: number;
  avatar?: any;
}

export default function ParentDashboardScreen() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigation = useNavigation();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  useEffect(() => {
    const fetchParent = async () => {
      try {
        const data = await getParentById();
        console.log("Parent data received:", data);
  
        // Extraire les compétitions
        const extractedCompetitions: Competition[] = [];
  
        if (data.adherents && data.adherents.length > 0) {
          data.adherents.forEach((adherent: Adherent) => {
            if (adherent.activites && adherent.activites.length > 0) {
              adherent.activites.forEach(activite => {
                if (activite.competition) {
                  const competition = {
                    id: activite.competition.id,
                    nom: activite.competition.nom,
                    date: activite.competition.date,
                    lieu: activite.competition.lieu || 'Lieu non précisé'
                  };
                  if (!extractedCompetitions.find(c => c.id === competition.id)) {
                    extractedCompetitions.push(competition);
                  }
                }
              });
            }
          });
        }
  
        // Traiter les adhérents pour ajouter progress + nextSession
        const adherentsMapped = await Promise.all(
          (data.adherents || []).map(async (adherent: Adherent) => {
            let latestNote = 0;
            let nextSessionDate: string | null = null;
  
            try {
              const perfRes = await axios.get(
                `http://192.168.100.107:8080/api/performances/adherent/${adherent.id}/last`,
                {
                  headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                  },
                }
              );
              latestNote = perfRes.data?.note ?? 0;
            } catch (err) {
              console.warn(`⚠️ Erreur performance adhérent ${adherent.id}`, err);
            }
  
            try {
              const sessionRes = await axios.get(
                `http://192.168.100.107:8080/api/sessions/next/adherent/${adherent.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
                  },
                }
              );
  
              if (sessionRes.data?.dateTime) {
                nextSessionDate = new Date(sessionRes.data.dateTime).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            } catch (err) {
              console.warn(`⚠️ Erreur session adhérent ${adherent.id}`, err);
            }
  
            return {
              ...adherent,
              activities: adherent.activites?.map(act => act.nom) || [],
              progress: latestNote,
              nextSession: nextSessionDate || 'Non spécifiée',
            };
          })
        );
  
        setParent(data);
        setAdherents(adherentsMapped);
        setCompetitions(extractedCompetitions);
      } catch (e) {
        console.error('❌ Erreur lors du chargement du parent:', e);
      }
    };
  
    fetchParent();
  }, []);
  
  const renderProgressBar = (progress: number) => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{progress}%</Text>
          <Text style={styles.progressLabel}>Complété</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <Image
        source={require('@/assets/images/pattern-bg.png')}        
        style={styles.backgroundPattern}
        resizeMode="cover"
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
              <Ionicons name="menu-outline" size={28} color="#6D28D9" />
            </TouchableOpacity>
            <Text style={styles.appName}>Club Sportif</Text>
          </View>
          
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#6D28D9" />
                {parent && parent.notifications && parent.notifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>{parent.notifications}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            {showNotifications && (
              <View style={styles.notificationDropdown}>
                <Text style={styles.notificationItem}>📅 Match samedi à 14h</Text>
                <Text style={styles.notificationItem}>💰 Paiement en attente</Text>
                <Text style={styles.notificationItem}>💬 Nouveau message du coach</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Parent Info Card */}
        <View style={styles.parentInfoCard}>
          <View style={styles.gradientBorder}>
            <View style={styles.parentAvatar}>
              {parent?.nom && (
                <Text style={styles.parentInitials}>{parent.nom.charAt(0)}</Text>
              )}
            </View>
          </View>
          <View style={styles.parentInfo}>
            {parent && (
              <>
                <Text style={styles.parentTitle}>Bonjour, {parent.prenom} 👋</Text>
                <Text style={styles.subTitle}>Membre depuis {parent.dateInscriptionClub || '---'}</Text>
              </>
            )}
          </View>
        </View>
        
        {/* Quick Links */}
        <View style={styles.quickLinksContainer}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/calendar')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#F0F4FF' }]}>
              <Ionicons name="calendar" size={22} color="#6366F1" />
            </View>
            <Text style={styles.quickLinkText}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/PaymentSelectionScreen')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="card-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.quickLinkText}>Paiements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/messagess')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="chatbubbles-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.quickLinkText}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/ParametresScreen')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="settings-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.quickLinkText}>Paramètre</Text>
          </TouchableOpacity>
        </View>
        
        {/* Adhérents Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Adhérents</Text>
          <TouchableOpacity style={styles.sectionAction}>
            <Text style={styles.sectionActionText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
        
        {/* Adhérents Cards */}
        {adherents && adherents.length > 0 ? (
          adherents
            .filter(child => child && child.nom) // sécurité
            .map((child, i) => (
              <View key={i} style={styles.childCard}>
                <View style={styles.childHeader}>
                  <View style={styles.childAvatar}>
                    {child.avatar ? (
                      <Image source={child.avatar} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.childInitials}>
                        {child.nom?.charAt(0) ?? '?'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.prenom} {child.nom}
                    </Text>
                    {/* Si tu veux afficher l'âge, il doit exister dans ton DTO */}
                    {child.age && <Text style={styles.childAge}>{child.age} ans</Text>}
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>

                <View style={styles.childContent}>
                  <View style={styles.nextSessionContainer}>
                    <View style={styles.nextSessionIconContainer}>
                      <Ionicons name="time-outline" size={18} color="#8B5CF6" />
                    </View>
                    <Text style={styles.nextSessionText}>
                      Prochaine séance :{' '}
                      <Text style={styles.nextSessionTime}>
                        {child.nextSession ?? 'Non spécifiée'}
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.activityTitle}>Activités</Text>
                  <View style={styles.activitiesList}>
                    {(child.activities ?? []).map((act, j) => (
                      <View key={j} style={styles.activityTag}>
                        <Text style={styles.activityText}>{act}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.progressTitle}>Progression globale</Text>
                  {renderProgressBar(child.progress ?? 0)}

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => router.push('/calendar')}
                    >
                      <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.secondaryButtonText}>Planning</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => router.push({
                        pathname: '/AdherentDetailScreen',
                        params: { adherentId: child.id }
                      })}
                    >
                      <Text style={styles.detailsButtonText}>Voir les détails</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
    style={styles.detailsButton}
    onPress={() => router.push({
      pathname: '/AdherentPerformanceScreen',
      params: { adherentId: child.id }
    })}
  >
    <Text style={styles.detailsButtonText}>Voir les détails</Text>
    <Ionicons name="arrow-forward" size={16} color="#fff" />
  </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.noAdherentsContainer}>
            <Text style={styles.noAdherentsText}>Aucun adhérent trouvé</Text>
          </View>
        )}

        {/* Upcoming Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <TouchableOpacity 
            style={styles.sectionAction}
            onPress={() => router.push('/calendar')}
          >
            <Text style={styles.sectionActionText}>Calendrier</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScrollView}>
          {competitions && competitions.length > 0 ? (
            competitions.map((comp, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.eventCard}
                onPress={() => router.push({
                  pathname: '/CompetitionDetailScreen',
                  params: { competitionId: comp.id }
                })}
              >
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>
                    {new Date(comp.date).getDate()}
                  </Text>
                  <Text style={styles.eventDateMonth}>
                    {new Date(comp.date).toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{comp.nom}</Text>
                  <View style={styles.eventDetails}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.eventDetailsText}>{comp.lieu || 'Lieu non précisé'}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.eventDetailsText}>
                      {new Date(comp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>Aucun événement à venir</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/dashboard')}
          >
            <Ionicons name="home" size={24} color="#8B5CF6" />
            <Text style={styles.navText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/calendar')}
          >
            <Ionicons name="calendar-outline" size={24} color="#71717A" />
            <Text style={[styles.navText, {color: '#71717A'}]}>Calendrier</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/messages')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#71717A" />
            <Text style={[styles.navText, {color: '#71717A'}]}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#71717A" />
            <Text style={[styles.navText, {color: '#71717A'}]}>Profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D28D9',
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
  },
  notificationButton: {
    padding: 6,
  },
  notificationIconContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  parentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  gradientBorder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  parentInitials: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  parentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  parentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subTitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  quickLink: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  quickLinkIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    color: '#4B5563',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    color: '#8B5CF6',
    fontSize: 14,
    marginRight: 4,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  childInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreButton: {
    padding: 8,
  },
  childContent: {
    padding: 16,
  },
  nextSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  nextSessionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextSessionText: {
    color: '#6B7280',
    fontSize: 14,
  },
  nextSessionTime: {
    color: '#6D28D9',
    fontWeight: 'bold',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 10,
  },
  activitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  activityTag: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  activityText: {
    color: '#8B5CF6',
    fontSize: 14,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 10,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  progressLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  eventsScrollView: {
    marginTop: 8,
    paddingLeft: 20,
    marginBottom: 24,
  },
  eventCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  eventDateBadge: {
    width: 60,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  eventDateDay: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDateMonth: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailsText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
    paddingBottom: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: 4,
  },
  notificationDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
    width: 250,
  },
  notificationItem: {
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 6,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  noAdherentsContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  noAdherentsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  noEventsContainer: {
    width: width - 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noEventsText: {
    color: '#6B7280',
    fontStyle: 'italic',
    fontSize: 16,
  }
});