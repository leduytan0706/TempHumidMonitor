// firebaseListener.js
import { ref, onValue } from "firebase/database";
import {realTimeDatabase as rtdb, fireStoreDatabase as fsdb} from "../lib/firebase";

// Hàm theo dõi dữ liệu
const listenToRealtimeData = (path, callback) => {
  const dataRef = ref(rtdb, path);

  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return unsubscribe;
};

export default listenToRealtimeData;
