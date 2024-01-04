import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getFirestore, getDocs, collection, getDoc, doc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, GoogleAuthProvider, useDeviceLanguage, signInWithPopup, getAuth } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

let app = null, analytics = null, db = null, auth = null, storage = null,firebaseConfig = null;
function connectToDB(){
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore();
}
$(document).ready(function () {
    if (localStorage.getItem("db_id") !== null) {
        window.location.href = "home.html";
    }
});