import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AdherentDTO, getAdherentsOfCurrentParent, getActivitiesByAdherent } from '@/services/adherent';
import axios from 'axios';
import * as Linking from 'expo-linking';

export default function PaymentSelectionScreen() {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];

  const [adherents, setAdherents] = useState<AdherentDTO[]>([]);
  const [selectedAdherent, setSelectedAdherent] = useState<AdherentDTO | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [activityPrices, setActivityPrices] = useState<Record<string, number>>({
    Football: 30,
    Basket: 25,
    Natation: 40,
    Tennis: 35
  });

  useEffect(() => {
    const loadAdherents = async () => {
      try {
        const data = await getAdherentsOfCurrentParent();
        setAdherents(data);
      } catch (error) {
        console.error("Erreur lors du chargement des adhérents:", error);
      }
    };

    loadAdherents();
  }, []);

  const handleAdherentSelect = async (adherent: AdherentDTO) => {
    setSelectedAdherent(adherent);
    setSelectedActivities([]);
    try {
      const activities = await getActivitiesByAdherent(adherent.id);
      setAvailableActivities(activities.map(a => a.nom));
    } catch (err) {
      console.error('Erreur chargement activités:', err);
      setAvailableActivities([]);
    }
  };

  const calculateTotal = () => {
    return selectedActivities.reduce((total, name) => {
      const prix = activityPrices[name] || 0;
      return total + prix * selectedMonths.length;
    }, 0);
  };

  const goToPayment = () => {
    if (selectedAdherent && selectedActivities.length && selectedMonths.length) {
      router.push({
        pathname: '/paymentscreen',
        params: {
          adherentName: selectedAdherent.prenom + ' ' + selectedAdherent.nom,
          activityName: selectedActivities.join(', '),
          amount: calculateTotal().toString()
        }
      });
    } else {
      alert('Veuillez compléter toutes les informations avant de continuer.');
    }
  };

  const handleKonnectPayment = async () => {
    try {
      const response = await axios.post('http://192.168.100.107:8080/api/konnect/pay', {
        "total": 10000,
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "22777777",
        "email": "john.doe@gmail.com",
        "description": "Paiement mensuel activité sportive"
      });
  
      const konnectUrl = response.data?.payment_url;
      if (typeof konnectUrl === 'string' && konnectUrl.startsWith('http')) {
        Linking.openURL(konnectUrl);
      } else {
        Alert.alert('Erreur', 'Lien Konnect non valide');
      }
    } catch (error) {
      console.error('Erreur Konnect:', error);
      Alert.alert('Erreur', 'Impossible de générer le lien de paiement.');
    }
  };
  

  const isFormComplete = selectedAdherent && selectedActivities.length > 0 && selectedMonths.length > 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />

      <View style={{ backgroundColor: '#6B46C1', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Sélection de paiement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Adhérents */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Adhérents</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {adherents.map(a => (
            <TouchableOpacity
              key={a.id}
              style={{
                padding: 10,
                margin: 4,
                backgroundColor: selectedAdherent?.id === a.id ? '#6B46C1' : '#E5E7EB',
                borderRadius: 8
              }}
              onPress={() => handleAdherentSelect(a)}
            >
              <Text style={{ color: selectedAdherent?.id === a.id ? '#fff' : '#000' }}>{a.prenom} {a.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mois */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginVertical: 8 }}>Mois à payer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {months.map(month => (
            <TouchableOpacity
              key={month}
              style={{
                padding: 10,
                margin: 4,
                backgroundColor: selectedMonths.includes(month) ? '#6B46C1' : '#E5E7EB',
                borderRadius: 8
              }}
              onPress={() =>
                setSelectedMonths(prev =>
                  prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
                )
              }
            >
              <Text style={{ color: selectedMonths.includes(month) ? '#fff' : '#000' }}>{month}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activités */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginVertical: 8 }}>Activités</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {availableActivities.map(activity => (
            <TouchableOpacity
              key={activity}
              style={{
                padding: 10,
                margin: 4,
                backgroundColor: selectedActivities.includes(activity) ? '#6B46C1' : '#E5E7EB',
                borderRadius: 8
              }}
              onPress={() =>
                setSelectedActivities(prev =>
                  prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
                )
              }
            >
              <Text style={{ color: selectedActivities.includes(activity) ? '#fff' : '#000' }}>{activity}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16 }}>Total à payer: <Text style={{ fontWeight: 'bold' }}>{calculateTotal()} €</Text></Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#6B46C1',
              padding: 14,
              borderRadius: 10,
              marginTop: 12,
              alignItems: 'center'
            }}
            onPress={goToPayment}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Procéder au paiement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#EC4899',
              padding: 14,
              borderRadius: 10,
              marginTop: 12,
              alignItems: 'center'
            }}
            onPress={handleKonnectPayment}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Payer avec Konnect</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F7FF',
  },
  header: {
    backgroundColor: '#6B46C1',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    color: '#4B5563',
    fontSize: 15,
  },
  selected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#6B46C1',
  },
  selectedText: {
    color: '#6B46C1',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9F7AEA',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  konnectButton: {
    backgroundColor: '#EC4899', // rose vif (Konnect)
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
});