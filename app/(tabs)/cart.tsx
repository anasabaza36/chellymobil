import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import { useCart } from '../auth/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  
  // Calcul du total
  const total = cartItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);
  
  // Calcul des frais de livraison (gratuits au-dessus de 100 TND)
  const shippingFee = total > 100 ? 0 : 7;
  
  // Total final avec frais de livraison
  const finalTotal = total + shippingFee;

  // Fonction pour diminuer la quantité
  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.size, item.quantity - 1);
    } else {
      removeFromCart(item.id, item.size);
    }
  };

  // Fonction pour augmenter la quantité
  const increaseQuantity = (item) => {
    updateQuantity(item.id, item.size, item.quantity + 1);
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#d1d1d1" />
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptySubtitle}>Ajoutez des articles pour commencer vos achats</Text>
      <TouchableOpacity style={styles.continueShopping}>
        <Text style={styles.continueShoppingText}>Continuer mes achats</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Image 
          source={item.image || require('C:/Users/lenovo/chellymobil/assets/images/chellysport-parent.png')} 
          style={styles.itemImage} 
          defaultSource={require('C:/Users/lenovo/chellymobil/assets/images/chellysport-parent.png')}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.designation}</Text>
          <Text style={styles.itemSize}>Taille: <Text style={styles.itemSizeValue}>{item.size}</Text></Text>
          <Text style={styles.itemPrice}>{item.prix} TND</Text>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => decreaseQuantity(item)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => increaseQuantity(item)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>{(item.prix * item.quantity).toFixed(2)} TND</Text>
        
        <TouchableOpacity 
          onPress={() => removeFromCart(item.id, item.size)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Panier</Text>
        {cartItems.length > 0 && (
          <Text style={styles.itemCount}>{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</Text>
        )}
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.id}-${item.size}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{total.toFixed(2)} TND</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>
                {shippingFee === 0 ? (
                  <Text style={styles.freeShipping}>Gratuit</Text>
                ) : (
                  `${shippingFee.toFixed(2)} TND`
                )}
              </Text>
            </View>
            
            {total < 100 && (
              <Text style={styles.shippingNote}>
                Ajoutez {(100 - total).toFixed(2)} TND d'articles pour bénéficier de la livraison gratuite
              </Text>
            )}

            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{finalTotal.toFixed(2)} TND</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => alert('✅ Commande validée avec succès !')}
            >
              <Text style={styles.checkoutButtonText}>Valider ma commande</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearCart}
            >
              <Text style={styles.clearButtonText}>Vider le panier</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  continueShopping: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  continueShoppingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemSizeValue: {
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 8,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  freeShipping: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  shippingNote: {
    fontSize: 13,
    color: '#8B5CF6',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  checkoutButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});