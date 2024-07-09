// server/database/firebase.js
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, update, push } = require("firebase/database");
const { signInWithCredential, getAuth } = require("firebase/auth");
require('dotenv').config()

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "veterinaryclinic-422805.firebaseapp.com",
  projectId: "veterinaryclinic-422805",
  storageBucket: "veterinaryclinic-422805.appspot.com",
  messagingSenderId: "385189370632",
  appId: "1:385189370632:web:9dc871608f26d8a2f02abd",
  measurementId: "G-B42DEKS32T",
  databaseURL: "https://veterinaryclinic-422805-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app)

module.exports = { auth, database, ref, set, get, update, signInWithCredential, push };
