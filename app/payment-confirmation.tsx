// app/payment-confirmation.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentConfirmationScreen() {
  const router = useRouter();
  
  // Animation confetti effect (simulated)
  const [showConfetti, setShowConfetti] = React.useState(true);
  
  React.useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.spacer}></View>
      </View>
      
      <View style={styles.content}>
        {/* Success animation/image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('C:/Users/lenovo/chellymobil/assets/images/confirmation.png')}
            style={styles.image}
            resizeMode="contain"
          />
          {showConfetti && (
            <View style={styles.confettiOverlay}>
              {/* This would ideally be replaced with an actual confetti animation library */}
              <Text style={styles.confetti}>✨🎉✨</Text>
            </View>
          )}
        </View>
        
        {/* Success message */}
        <View style={styles.messageCard}>
          <Text style={styles.heading}>Payment Successful!</Text>
          <Text style={styles.subtext}>
            You have successfully enrolled in the course. Your learning journey begins now!
          </Text>
          
          {/* Order details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>#TRX-2598742</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/course-details')}
        >
          <Text style={styles.primaryButtonText}>Aller à la page home</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7FF', // Light purple tinted white
  },
  header: {
    backgroundColor: '#6B46C1', // Primary purple
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
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: 150,
    height: 120,
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    fontSize: 40,
    position: 'absolute',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#F9F7FF',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2D9F3',
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6B46C1',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});