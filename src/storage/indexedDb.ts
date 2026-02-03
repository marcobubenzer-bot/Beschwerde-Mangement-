const DB_NAME = 'klinikbeschwerde_db';
const DB_VERSION = 1;

const createStores = (db: IDBDatabase) => {
  if (!db.objectStoreNames.contains('complaints')) {
    db.createObjectStore('complaints', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('attachments')) {
    db.createObjectStore('attachments', { keyPath: 'id' });
  }
};

export const openDatabase = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      createStores(request.result);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const runTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T
) => {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    Promise.resolve(callback(store))
      .then((result) => {
        transaction.oncomplete = () => {
          db.close();
          resolve(result);
        };
      })
      .catch((error) => {
        transaction.abort();
        db.close();
        reject(error);
      });
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const requestToPromise = <T>(request: IDBRequest<T>) => {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
