import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getFirestore, getDocs, collection, getDoc, doc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, GoogleAuthProvider, useDeviceLanguage, signInWithPopup, getAuth } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

let app = null, analytics = null, db = null, auth = null, storage = null,firebaseConfig = null;
function connectToDB(){
    try{
        showPopup("Loading...","Please wait...","loading",false);
        app = initializeApp(window.firebaseConfig);
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
async function closeModal(){
    gsap.fromTo(".modal-c", {opacity: 1}, {opacity: 0, duration: 0.5, ease: "power2.out"});
    gsap.fromTo(".modal-c .modal", {y:0}, {y:100, duration: 0.5, ease: "power2.out"});
    setTimeout(function(){
        $(".modal-c").addClass("hidden");
    },500);

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
function getSelectionCoords(atStart) {
    const sel = window.getSelection();
  
    // check if selection exists
    if (!sel.rangeCount) return null;
  
    // get range
    let range = sel.getRangeAt(0).cloneRange();
    if (!range.getClientRects) return null;
  
    // get client rect
    range.collapse(atStart);
    let rects = range.getClientRects();
    if (rects.length <= 0) return null;
  
    // return coord
    let rect = rects[0];
    return rect;
}

async function openDragNDrop(el,el2){
    return new Promise((resolve,reject)=>{
        let uuid = "_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let appendable = $(`<div class="dragndrop" id="dragndrop${uuid}"><div><div class="plus-icon"><div class="_1"></div><div class="_2"></div></div><span>Drop Files Here</span></div></div>`)[0];
        gsap.fromTo(appendable, {opacity: 0,y:100}, {opacity: 1,y:0, duration: 0.2, ease: "power2.out"});

        $("body").append(appendable);
        let dragndrop = $("#dragndrop"+uuid+" > div");
        dragndrop.on("dragenter",function(e){
            e.preventDefault();
            e.stopPropagation();
            dragndrop.addClass("dragging");
        });
        dragndrop.on("dragleave",function(e){
            e.preventDefault();
            e.stopPropagation();
            dragndrop.removeClass("dragging");
        });
        dragndrop.on("dragover",function(e){
            e.preventDefault();
            e.stopPropagation();
        });
        dragndrop.on("drop",async function(e){
            e.preventDefault();
            e.stopPropagation();
            dragndrop.removeClass("dragging");
            let files = e.originalEvent.dataTransfer.files;
            let imageEl = null;
            for(let i = 0;i < files.length;i++){
                //to base64
                let reader = new FileReader();
                reader.readAsDataURL(files[i]);
                reader.onload = async function () {
                    //read as base64
                    let base64 = reader.result;
                    // append
                    imageEl = $(`<img src="${base64}" alt="Image">`)[0];
                    el2.find(".virtual").append(imageEl);
                    // remove dragndrop
                    gsap.fromTo(appendable, {opacity: 1,y:0}, {opacity: 0,y:100, duration: 0.2, ease: "power2.out",onComplete:()=>{appendable.remove();}});
                    imageEl.onload = resolve;
                };
            }
        });
    });
    
}

async function registerVirtualTextarea(){
    $(".wysiwyg").each(function(){
        let el = $(this);
        let uuid = "_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        el.parent().append(`<div class="tools" id="tools${uuid}" style="opacity:0">
        <button class="nozoom bold round">B</button>
        <button class="nozoom italic round">I</button>
        <button class="nozoom underline round">U</button>
        <button class="nozoom strikethrough round">S</button>
        <button class="nozoom LaTeX round">\\(\\LaTeX\\)</button>
        <button class="nozoom add-image round"><div class="icon"><img src="assets/images/image-regular.svg" alt="Image"></div></button>
    </div>`);
        try{MathJax.typeset();}catch(e){console.log(e);}
        $("#tools"+uuid+" .bold").click(function(){
            document.execCommand("bold",false,null);
        });
        $("#tools"+uuid+" .italic").click(function(){
            document.execCommand("italic",false,null);
        });
        $("#tools"+uuid+" .underline").click(function(){
            document.execCommand("underline",false,null);
        });
        $("#tools"+uuid+" .strikethrough").click(function(){
            document.execCommand("strikeThrough",false,null);
        });
        $("#tools"+uuid+" .LaTeX").click(function(){
            MathJax.typeset();
            let fixer = "&nbsp;";
            el.find("mjx-container").each(function(){
                let el = $(this);
                el.attr("contenteditable","false");
                if(el.next().length == 0){
                    el.after(fixer);
                }else{
                    if(el.next().prop("tagName") != "DIV" && el.next().prop("tagName") != "B"){
                        el.after(fixer);
                    }
                }
            });
        });
        let dragndrop_opened = false;
        let dtl = null;
        let isFocused = false;

        el.parent().mouseenter(function(){
            isFocused=true;
            gsap.to("#tools"+uuid,{duration:0.3,ease:"power4.out",opacity:1});
            gsap.to(el.find(".background")[0],{duration:0.3,ease:"power4.out",borderTopRightRadius:0});
        });
        el.parent().mouseleave(function(){
            if(dragndrop_opened) return;
            isFocused=false;
            gsap.fromTo(".dragndrop", {opacity: 1,y:0}, {opacity: 0,y:100, duration: 0.2, ease: "power2.out",onComplete:()=>{$(".dragndrop").remove();}})
            gsap.to("#tools"+uuid,{duration:0.3,ease:"power4.out",opacity:0});
            gsap.to(el.find(".background")[0],{duration:0.3,ease:"power4.out",borderTopRightRadius:12});
        });
        $("#tools"+uuid+" .add-image").click(async function(){
            if(dragndrop_opened){
                if(dtl) dtl.kill();
                dtl = gsap.fromTo(".dragndrop", {opacity: 1,y:0}, {opacity: 0,y:100, duration: 0.2, ease: "power2.out",onComplete:()=>{$(".dragndrop").remove();}});
                dragndrop_opened = false;
                return;
            }

            dragndrop_opened = true;
            await openDragNDrop($("#tools"+uuid)[0],el);
            dragndrop_opened = false;
            inputFunc();
            console.log("done");
            let fixer = "&nbsp;";
            el.find("img").each(function(){
                let el = $(this);
                el.attr("contenteditable","false");
                if(el.next().length == 0){
                    el.after(fixer);
                }else{
                    if(el.next().prop("tagName") != "DIV" && el.next().prop("tagName") != "B"){
                        el.after(fixer);
                    }
                }
            });
        });
        let inputFunc = function(){
            let val = el.find(".virtual").html();
            // el.find(".virtual-textarea").html(val);
            let tempEl = $("<div class='measurement-element' style='pointer-events:none;display:none;opacity:0'>"+val.replaceAll("\n","<br>")+"<br></div>");
            // tempEl.css("font-size",el.find(".virtual").css("font-size"));
            // tempEl.css("font-family",el.find(".virtual").css("font-family"));
            tempEl.css("width",String(el.find("textarea").width()) + "px");
            $("body").append(tempEl);
            let h = tempEl.height();
            tempEl.remove();
            gsap.to([el[0],el.find(".background")[0]],{duration:0.3,ease:"power4.out",height:h});
            // updateCursor();
        };
        inputFunc();
        el.on("keydown",inputFunc);
        el.on("keyup",inputFunc);
    });
}
async function showStudysets(){
    $(".c").html(`<section>
    <div class="flex-opposite nav"><h1 class="glow">Your studysets</h1><button class="glowbox" id="createstudyset">+ Add</button></div>
    <div class="card-list"></div>
</section>`);
    const studysets = await getDocs(collection(db, "studysets"));
    studysets.forEach((doc) => {
        let studyset = doc.data();
        let el = $(`
        <div class="card studyset">
            <div class="card-item" style="width:100%"><div class="pill" style="background:${studyset.background}"></div></div>
            <div class="card-item"><span class="title">${studyset.name}</span></div>
            <div class="card-item"><span class="description">${Object.keys(studyset.flashcards).length} Flashcards</span></div>
        </div>`)[0];
        $("section > .card-list").append(el);
        $(el).click(function(){
            studySet = studyset;
            flashcards = studyset.flashcards;
            studySetID = doc.id;
            currentPage = "createstudyset";
            updatePage();
        });
    });
    $("#createstudyset").click(function(){
        openModal("Create Studyset",$(`<div class="card-item"><input type="text" placeholder="Name" id="studysetname"></div><div class="card-item input-color-c"><input type="color" id="studysetcolor" value="#627aca"></div>`),$(`<button class="active big">OK</button>`)[0]);
        $(".modal-c .modal .3 button").click(async function(){
            if($("#studysetname").val().length == 0){
                showError("Please enter a name");
                return;
            }
            studySet = {name:$("#studysetname").val(),background:$("#studysetcolor").val(),flashcards:{}};
            flashcards = {};
            closeModal();
            let docRef = await addDoc(collection(db, "studysets"), studySet);
            studySetID = docRef.id;
            currentPage = "createstudyset";
            updatePage();
        });
    });
}
let flashcards = {"1":{front:"Front",back:"Back"}};
let studySet = {name:"Math",background:"#8fad79"};
let studySetID = null;
async function saveStudySet(){
    console.log("Saving...");
    console.log(studySet,flashcards);
    if(studySetID == null){
        console.log("ERROR: studySetID is null");
    }else{
        let o = JSON.parse(JSON.stringify(studySet));
        o.flashcards = flashcards;
        await updateDoc(doc(db, "studysets", studySetID), o);
        console.log("Saved!");
    }
}


async function showCreateStudyset(){
    let editMode = false;
    let currentlyEditing = null;
    $(".c").html(`<section class="flashcard-page">
    <div class="grid12">
        <div class="summary">
            <div class="card">
                <div class="card-item back-btn-c"><button class="nozoom back-btn"><</button></div>
                <div class="card-item"><h1>Create/Edit Flashcards</h1></div>
                <div class="card-item"><button class="nozoom addflashcard">+ Add Flashcard</button></div>
            </div>
            <div class="cardlist-c">
                
                <div class="cardlist">
                    
                </div>
            </div>
        </div>
            <div class="flashcard-editor">
                <div class="card center">
                    <div class="card-item"><h1>Flashcard</h1></div>
                    <div class="card-item texteditor being-edited fronteditor">
                        <div class="wysiwyg">
                            <div class="background"></div>
                            <div class="virtual" contenteditable="true" spellcheck="false">Front</div>
                        </div>
                    </div>
                    <div class="card-item texteditor being-edited mtop backeditor">
                        <div class="wysiwyg">
                            <div class="background"></div>
                            <div class="virtual" contenteditable="true" spellcheck="false">Back</div>
                        </div>
                    </div>
                    <div class="card-item hidden" id="saveflashcardbutton">
                        <button class="nozoom saveflashcard">Save</button>
                    </div>
                </div>
            </div>
    </div>
</section>`);
    registerVirtualTextarea();
    $("body").get(0).style.setProperty("--summary-height", String($(".summary > .card").height())+"px");
    function registerFlashcard(key){
        let fc = flashcards[key];
        let el = $(`<div class="card flashcard" id="flashcard_${key}">
        <div class="options-c">
            <div class="options">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
        <div class="context-menu-c hidden">
            <div class="entry edit-entry">Edit</div>
            <div class="entry delete-entry">Delete</div>
        </div>
        <div class="card-item sides-preview">
            <div class="side-preview">${fc.front}</div>
            <div class="side-preview">${fc.back}</div>
        </div>
    </div>`);
        let open = false;
        el.find(".options-c").click(function(){
            open = !open;
            if(open){
                el.find(".context-menu-c").removeClass("hidden");
                gsap.fromTo(el.find(".context-menu-c"), {opacity: 0}, {opacity: 1, duration: 0.2, ease: "power2.out"});
            }else{
                gsap.fromTo(el.find(".context-menu-c"), {opacity: 1}, {opacity: 0, duration: 0.2, ease: "power2.out",onComplete:()=>{el.find(".context-menu-c").addClass("hidden");}});
            }
        });
        el.find(".edit-entry").click(function(){
            el.find(".options-c").trigger("click");
            editMode = true;
            $(".flashcard-editor").removeClass("editing-mode");

            $(".flashcard-editor").addClass("editing-mode");
            $("#saveflashcardbutton").removeClass("hidden");
            $(".fronteditor .virtual").html(fc.front);
            $(".backeditor .virtual").html(fc.back);
            currentlyEditing = key;
        });
        el.find(".delete-entry").click(function(){
            el.find(".options-c").trigger("click");
            if(currentlyEditing==key){
                editMode = false;
                $(".flashcard-editor").removeClass("editing-mode");
                $("#saveflashcardbutton").addClass("hidden");
            }
            delete flashcards[key];
            el.remove();
            currentlyEditing = null;
            saveStudySet();
        });

        $(".cardlist").append(el);
        $(".back-btn-c").click(function(){
            console.log(1)
            currentPage = "home";
            updatePage();
        });
    }
    Object.keys(flashcards).forEach(registerFlashcard);
    $("#saveflashcardbutton").click(function(){
        editMode = false;
        $(".flashcard-editor").removeClass("editing-mode");
        $("#saveflashcardbutton").addClass("hidden");
        flashcards[currentlyEditing].front = $(".fronteditor .virtual").html();
        flashcards[currentlyEditing].back = $(".backeditor .virtual").html();
        $("#flashcard_"+currentlyEditing+" .side-preview").eq(0).html($(".fronteditor .virtual").html());
        $("#flashcard_"+currentlyEditing+" .side-preview").eq(1).html($(".backeditor .virtual").html());
        currentlyEditing = null;
        $(".fronteditor .virtual, .backeditor .virtual").html("");
        saveStudySet();
    });

    $(".addflashcard").click(function(){
        let newUUID = "_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        flashcards[newUUID] = {front:$(".fronteditor .virtual").html(),back:$(".backeditor .virtual").html()};
        registerFlashcard(newUUID);
        $(".fronteditor .virtual, .backeditor .virtual").html("");
        saveStudySet();
    });

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
    updatePage();
    // showCreateStudyset();
}
$(document).ready(async function () {
    // currentPage = "home";
    // $("#createstudyset").on("click",()=>{
    //     currentPage = "createstudyset";
    //     updatePage();
    // });
    if (localStorage.getItem("db_id") != null) {
        console.log("DB ID found");
        window.firebaseConfig = JSON.parse(localStorage.getItem("db_id"));
        connectToDB();
    }else{
        await openModal("Enter your database json",$(`<textarea></textarea>`)[0],$(`<button class="active big">OK</button>`)[0]);
        $(".modal-c .modal .3 button").click(function(){
            try{
                // firebaseConfig = JSON.parse($(".modal-c .modal .2 textarea").val());
                eval(`window.firebaseConfig = ${$(".modal-c .modal .2 textarea").val()}`);
                localStorage.setItem("db_id",JSON.stringify(window.firebaseConfig));
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