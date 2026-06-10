import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Firebase config kamu
const firebaseConfig = {
  apiKey: "AIzaSyD1NPbzjRhUC_Tg2biTbmBdXTYouaqkjlQ",
  authDomain: "lovable-71441.firebaseapp.com",
  databaseURL: "https://lovable-71441-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lovable-71441",
  storageBucket: "lovable-71441.firebasestorage.app",
  messagingSenderId: "801237444224",
  appId: "1:801237444224:web:9350e2a27d19b69e87e865"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// path data couple
const DATA_PATH = "capsuleData";

// simpan ke firebase
function saveToCloud(data) {
  set(ref(db, DATA_PATH), data);
}

// realtime listener
function listenCloud(callback) {
  onValue(ref(db, DATA_PATH), (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
}

export {
  db,
  saveToCloud,
  listenCloud
};
