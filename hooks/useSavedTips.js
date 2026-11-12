import { useEffect, useState } from 'react';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../firebase';

// Ids de los tips guardados del usuario, en tiempo real (users/{uid}/savedTips).
export function useSavedTips(uid) {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    if (!uid) {
      setIds([]);
      return undefined;
    }
    return onSnapshot(
      collection(db(), 'users', uid, 'savedTips'),
      (snap) => setIds(snap.docs.map((d) => d.id)),
      () => setIds([])
    );
  }, [uid]);
  return ids;
}
