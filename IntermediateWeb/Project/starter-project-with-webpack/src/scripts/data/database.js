import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'bookmarked-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
        if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
            database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
            console.log(`Object Store '${OBJECT_STORE_NAME}' created successfully`);
        }
    },
});

const BookmarkDB = {
    async getAll() {
        try {
            const db = await dbPromise;
            const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
            const store = tx.objectStore(OBJECT_STORE_NAME);
            return await store.getAll();
        } catch (error) {
            console.error('Error getting all bookmarked stories:', error);
            return [];
        }
    },

    async get(id) {
        try {
            const db = await dbPromise;
            const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
            const store = tx.objectStore(OBJECT_STORE_NAME);
            return await store.get(id);
        } catch (error) {
            console.error(`Error getting bookmarked story with ID ${id}:`, error);
            return null;
        }
    },

    async save(story) {
        try {
            const db = await dbPromise;
            const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
            const store = tx.objectStore(OBJECT_STORE_NAME);
            
            const storyToSave = {
                ...story,
                bookmarkedAt: new Date().toISOString()
            };
            
            await store.put(storyToSave);
            return true;
        } catch (error) {
            console.error('Error saving bookmarked story:', error);
            return false;
        }
    },

    async delete(id) {
        try {
            const db = await dbPromise;
            const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
            const store = tx.objectStore(OBJECT_STORE_NAME);
            await store.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting bookmarked story with ID ${id}:`, error);
            return false;
        }
    },

    async isBookmarked(id) {
        try {
            const db = await dbPromise;
            const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
            const store = tx.objectStore(OBJECT_STORE_NAME);
            const result = await store.get(id);
            return !!result;
        } catch (error) {
            console.error(`Error checking if story with ID ${id} is bookmarked:`, error);
            return false;
        }
    },
};

export default BookmarkDB;