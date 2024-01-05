import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getFirestore, getDocs, collection, getDoc, doc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, GoogleAuthProvider, useDeviceLanguage, signInWithPopup, getAuth } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

let app = null, analytics = null, db = null, auth = null, storage = null,firebaseConfig = null;
function connectToDB(){
    try{
        app = initializeApp(firebaseConfig);
        analytics = getAnalytics(app);
        db = getFirestore();
        closePopup();
        startApp();
    }catch(e){
        console.log(e);
        localStorage.removeItem("db_id");
        showError(e);
    }
    
}
async function openModal(title, body, footer){
    $(".modal-c .modal .1 span,.modal-c .modal .2,.modal-c .modal .3").empty();
    $(".modal-c .modal .1 span").append(title);
    $(".modal-c .modal .2").append(body);
    $(".modal-c .modal .3").append(footer);
    $(".modal-c").removeClass("hidden");
    gsap.fromTo(".modal-c", {opacity: 0}, {opacity: 1, duration: 0.5, ease: "power2.out"});
    gsap.fromTo(".modal-c .modal", {y:100}, {y:0, duration: 0.5, ease: "power2.out"});
}
async function showPopup(title,text,className,clickremove = true){
    let el = $(`<div class="popup-c ${className}"><div class="popup"><div class="card-item"><span class="big title">${title}</span></div><div class="card-item">${text}</div></div></div>`);
    if(clickremove)
        el.click(closePopup);
    $("body").append(el);
    gsap.fromTo(el, {opacity: 0,y:100}, {opacity: 1, duration: 0.3,y:0, ease: "power2.out"});
}
async function closePopup(){
    gsap.fromTo(".popup-c", {opacity: 1,y:0}, {opacity: 0, duration: 0.3,y:100, ease: "power2.out"});
            setTimeout(function(){
                $(".popup-c").remove();
            },500);
}
async function showError(e){
    showPopup("Error!",e,"error");
}
async function showStudysets(){
    $(".c").html(`<section>
    <div class="flex-opposite nav"><h1 class="glow">Your studysets</h1><button class="glowbox" id="createstudyset">+ Add</button></div>
    <div class="card-list">
        <div class="card studyset">
            <div class="card-item"><div class="pill"></div></div>
            <div class="card-item"><span class="title">Math</span></div>
            <div class="card-item"><span class="description">10 Flashcards</span></div>
        </div>
    </div>
</section>`);
    const studysets = await getDocs(collection(db, "studysets"));
    // await addDoc(collection(db, "users"), {
    //     first: "Alan",
    //     middle: "Mathison",
    //     last: "Turing",
    //     born: 1912
    //   });
    studysets.forEach((doc) => {
        let studyset = doc.data();
        console.log(studyset);
    });
}
async function showCreateStudyset(){

}
let currentPage = "home";
async function updatePage(){
    switch(currentPage){
        case "home":
            showStudysets();
            break;
        case "createstudyset":
            showCreateStudyset();
            break;
        default:
            showStudysets();
            break;
    }

}
async function startApp(){
    // showStudysets();
}
$(document).ready(async function () {
    currentPage = "home";
    $("#createstudyset").on("click",()=>{
        currentPage = "createstudyset";
        updatePage();
    });
    showPopup("Loading...","Please wait...","loading",false);
    if (localStorage.getItem("db_id") != null) {
        console.log("DB ID found");
        firebaseConfig = JSON.parse(localStorage.getItem("db_id"));
        connectToDB();
    }else{
        await openModal("Enter your database json",$(`<textarea name="" id="" cols="30" rows="10"></textarea>`)[0],$(`<button class="active big">OK</button>`)[0]);
        $(".modal-c .modal .3 button").click(function(){
            try{
                // firebaseConfig = JSON.parse($(".modal-c .modal .2 textarea").val());
                eval(`window.firebaseConfig = ${$(".modal-c .modal .2 textarea").val()}`);
                console.log(firebaseConfig);
                localStorage.setItem("db_id",JSON.stringify(firebaseConfig));
                connectToDB();
                $(".modal-c").addClass("hidden");
                
            }catch(e){
                showError(e);
            }
        });
    }
});

/*{

    apiKey: "AIzaSyD9lNLrK4D9xaRkOuu7J7yoLiFUz677ZlI",

    authDomain: "cards-c322e.firebaseapp.com",

    projectId: "cards-c322e",

    storageBucket: "cards-c322e.appspot.com",

    messagingSenderId: "887402756734",

    appId: "1:887402756734:web:1ba67d657db0a986a1762f",

    measurementId: "G-Y3D3F5LDS7"

  } */