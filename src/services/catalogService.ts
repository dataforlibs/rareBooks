import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CatalogItem } from '../catalog/types';

const CATALOG_COLLECTION = 'catalog-items';

class CatalogService {
  /**
   * Save a catalog item (create or update)
   */
  async saveCatalogItem(item: CatalogItem): Promise<string> {
    try {
      const itemId = item.id || `item-${Date.now()}`;
      const docRef = doc(db, CATALOG_COLLECTION, itemId);

      const catalogData = {
        ...item,
        id: itemId,
        lastModified: new Date().toISOString(),
        _timestamp: Timestamp.now()
      };

      await setDoc(docRef, catalogData, { merge: true });
      
      console.log('✅ Catalog item saved:', itemId);
      return itemId;
    } catch (error) {
      console.error('❌ Error saving catalog item:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to save catalog item'
      );
    }
  }

  /**
   * Get a single catalog item by ID
   */
  async getCatalogItem(itemId: string): Promise<CatalogItem | null> {
    try {
      const docRef = doc(db, CATALOG_COLLECTION, itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as CatalogItem;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching catalog item:', error);
      throw new Error('Failed to fetch catalog item');
    }
  }

  /**
   * Get all catalog items
   */
  async getAllCatalogItems(maxItems: number = 100): Promise<CatalogItem[]> {
    try {
      const q = query(
        collection(db, CATALOG_COLLECTION),
        orderBy('_timestamp', 'desc'),
        limit(maxItems)
      );

      const querySnapshot = await getDocs(q);
      const items: CatalogItem[] = [];

      querySnapshot.forEach((doc) => {
        items.push(doc.data() as CatalogItem);
      });

      console.log(`✅ Fetched ${items.length} catalog items`);
      return items;
    } catch (error) {
      console.error('❌ Error fetching catalog items:', error);
      throw new Error('Failed to fetch catalog items');
    }
  }

  /**
   * Search catalog items by title
   */
  async searchByTitle(searchTerm: string): Promise<CatalogItem[]> {
    try {
      // Note: This is a simple search. For better search, use Algolia or similar
      const q = query(
        collection(db, CATALOG_COLLECTION),
        where('titleProper', '>=', searchTerm),
        where('titleProper', '<=', searchTerm + '\uf8ff'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const items: CatalogItem[] = [];

      querySnapshot.forEach((doc) => {
        items.push(doc.data() as CatalogItem);
      });

      return items;
    } catch (error) {
      console.error('❌ Error searching catalog items:', error);
      throw new Error('Failed to search catalog items');
    }
  }

  /**
   * Update a catalog item
   */
  async updateCatalogItem(
    itemId: string, 
    updates: Partial<CatalogItem>
  ): Promise<void> {
    try {
      const docRef = doc(db, CATALOG_COLLECTION, itemId);
      
      await updateDoc(docRef, {
        ...updates,
        lastModified: new Date().toISOString(),
        _timestamp: Timestamp.now()
      });

      console.log('✅ Catalog item updated:', itemId);
    } catch (error) {
      console.error('❌ Error updating catalog item:', error);
      throw new Error('Failed to update catalog item');
    }
  }

  /**
   * Delete a catalog item
   */
  async deleteCatalogItem(itemId: string): Promise<void> {
    try {
      const docRef = doc(db, CATALOG_COLLECTION, itemId);
      await deleteDoc(docRef);
      
      console.log('✅ Catalog item deleted:', itemId);
    } catch (error) {
      console.error('❌ Error deleting catalog item:', error);
      throw new Error('Failed to delete catalog item');
    }
  }

  /**
   * Get items by status
   */
  async getItemsByStatus(status: string): Promise<CatalogItem[]> {
    try {
      const q = query(
        collection(db, CATALOG_COLLECTION),
        where('recordStatus', '==', status),
        orderBy('_timestamp', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const items: CatalogItem[] = [];

      querySnapshot.forEach((doc) => {
        items.push(doc.data() as CatalogItem);
      });

      return items;
    } catch (error) {
      console.error('❌ Error fetching items by status:', error);
      throw new Error('Failed to fetch items by status');
    }
  }
}

// Export singleton instance
export const catalogService = new CatalogService();
