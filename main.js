import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getFirestore, getDocs, collection, getDoc, doc, setDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, GoogleAuthProvider, useDeviceLanguage, signInWithPopup, getAuth } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";


let app = null, analytics = null, db = null, auth = null, storage = null,firebaseConfig = null;
let loaders = [];
let loadingElements = [];
function connectToDB(){
    try{
        showPopup("Loading...","Please wait...","loading",false);
        app = initializeApp(window.firebaseConfig);
        // analytics = getAnalytics(app);
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
    $(".modal-c .modal .1 span,.modal-c .modal ._2,.modal-c .modal .3").empty();
    $(".modal-c .modal .1 span").append(title);
    $(".modal-c .modal ._2").append(body);
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
async function openDragNDropImport(){
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
            for(let i = 0;i < files.length;i++){
                //read text
                let reader = new FileReader();
                reader.readAsText(files[i]);
                reader.onload = function () {
                    //read as text
                    let text = reader.result;
                    // remove dragndrop
                    gsap.fromTo(appendable, {opacity: 1,y:0}, {opacity: 0,y:100, duration: 0.2, ease: "power2.out",onComplete:()=>{appendable.remove();}});
                    resolve(text);
                }
            }
        });
    });
    
}
async function showStudysets(){
    $(".c").html(`<section class="homepage">
    <div class="flex-opposite nav"><h1 class="glow">Your studysets</h1><div><button class="glowbox" id="createstudyset">+ Add</button><button class="glowbox" id="importstudyset">Import</button></div></div>
    <div class="card-list"></div>
</section>`);
    showLoaderAtElement($(".card-list")[0]);
    const studysets = await getDocs(collection(db, "studysets"));
    removeAllLoaders();
    studysets.forEach((DOC) => {
        try{
            let studyset = DOC.data();
            let el = $(`
            <div class="card studyset">
                <div class="options-c">
                    <div class="options">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
                <div class="context-menu-c hidden">
                    <div class="entry export-entry">Export</div>
                    <div class="entry share-entry">Share Link</div>
                    <div class="entry delete-entry destroy">Delete</div>
                </div>
                <div class="card-item" style="width:100%"><div class="pill" style="background:${studyset.background}"></div></div>
                <div class="card-item"><span class="title">${studyset.name}</span></div>
                <div class="card-item"><span class="description">${Object.keys(studyset.flashcards).length} Flashcards</span></div>
            </div>`)[0];
            $("section > .card-list").append(el);
            let open = false;
            $(el).find(".options-c").click(function(){
                open = !open;
                if(open){
                    $(el).find(".context-menu-c").removeClass("hidden");
                    gsap.fromTo($(el).find(".context-menu-c"), {opacity: 0}, {opacity: 1, duration: 0.2, ease: "power2.out"});
                }else{
                    gsap.fromTo($(el).find(".context-menu-c"), {opacity: 1}, {opacity: 0, duration: 0.2, ease: "power2.out",onComplete:()=>{$(el).find(".context-menu-c").addClass("hidden");}});
                }
            });
            const deleteMe = async function(){
                showLoaderAtElement(el,true);
                // remove studyset from db
                await deleteDoc(doc(db, "studysets", DOC.id));
                //remove progress from db
                await deleteDoc(doc(db, "progress", DOC.id));
                //remove progress_flashcards from db
                await deleteDoc(doc(db, "progress_flashcards", DOC.id));
                removeAllLoaders();
                //remove studyset from page
                let rects = [];
                let foundElementYet = false;
                let padding = 50;
                //if screen width 
                if($(window).width() <= 767){
                    padding = 20;
                }
                let tl = gsap.timeline({onComplete:()=>{
                    $(el).remove();
                    $(".card-list .card").each(function(i){
                        gsap.set(this,{x:0,y:0,width:rects[i].width-padding,height:rects[i].height-padding})
                    });
                    updatePage();
                }});
                tl.to(el,{duration:1,ease:"power2.out",opacity:0,onUpdate:()=>{
                    gsap.set(el,{filter:"blur("+(tl.progress())*10+"px)",transform:"scale("+((tl.progress()/6)+1)+")"});
                }},"<");
                // tl.to(el,{duration:0},"<-=0.4");
                $(".card-list .card").each(function(i){
                    // console.log(i)
                    let rect = this.getBoundingClientRect();
                    rects.push({top:rect.top,left:rect.left,width:rect.width,height:rect.height});
                    if(foundElementYet){
                        tl.to(this,{duration:0.7,ease:"power2.out",x:rects[i-1].left-rect.left,y:rects[i-1].top-rect.top,width:rects[i-1].width-padding,height:rects[i-1].height-padding},"<+=0.05");
                    }
                    if(this.isEqualNode(el)) foundElementYet = true;
                });
            };
            $(el).find(".delete-entry").click(()=>{
                //are you sure
                openModal("Are you sure?","<span>This action is irreversible.</span>",`<button class="destroy big nozoom">Yes</button><button class="big ok nozoom">No</button>`);
                $(".modal-c .modal .3 button").click(function(){
                    if($(this).hasClass("destroy")){
                        deleteMe();
                        closeModal();
                    }else{
                        closeModal();
                    }
                });
            });
            $(el).find(".export-entry").click(async function(){
                //download studyset
                let text = JSON.stringify(studyset);
                let blob = new Blob([text], {type: "application/json"});
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = studyset.name+".deck";
                a.click();
                open = false;
                gsap.fromTo($(el).find(".context-menu-c"), {opacity: 1}, {opacity: 0, duration: 0.2, ease: "power2.out",onComplete:()=>{$(el).find(".context-menu-c").addClass("hidden");}});
            });
            $(el).find(".share-entry").click(async function(){
                //share studyset
                let text = JSON.stringify(studyset);
                openModal("Copy Link",$(`<div class="card-item"><input type="text" value="${window.location.href.split("?")[0]}?import=${encodeURIComponent(text)}" readonly style="overflow-x:shown"></div>`),$(`<button class="active big">OK</button>`)[0]);
                $(".modal-c .modal .3 button").click(function(){
                    closeModal();
                });
                open = false;
                gsap.fromTo($(el).find(".context-menu-c"), {opacity: 1}, {opacity: 0, duration: 0.2, ease: "power2.out",onComplete:()=>{$(el).find(".context-menu-c").addClass("hidden");}});
            });
            $(el).find(".card-item").click(function(){
                studySet = studyset;
                flashcards = studyset.flashcards;
                studySetID = DOC.id;
                currentPage = "createstudyset";
                updatePage();
            });
        }catch(e){
            showError(e);
            console.log(e);
            return;
        }
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
    $("#importstudyset").click(async function(){
        let text = await openDragNDropImport($("section")[0]);
        let set = {};
        try{
            set = JSON.parse(text);
            console.log(set);
            if(set.name == undefined || set.background == undefined || set.flashcards == undefined){
                showError("Invalid Flashcard Structure");
                return;
            }else{
                showLoaderAtElement($("body")[0],true);
                let docRef = await addDoc(collection(db, "studysets"), set);
                updatePage();
                removeAllLoaders();
            }
        }catch(error){
            showError("Invalid JSON");
            return;
        }
    });
    //set css variable
    $("body").get(0).style.setProperty("--nav-height", String($(".nav").height())+"px");
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
                <div class="card-item"><button class="nozoom study-set">Study set</button></div>
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
                            <div class="virtual" contenteditable="true" spellcheck="false"></div>
                        </div>
                    </div>
                    <div class="card-item texteditor being-edited mtop backeditor">
                        <div class="wysiwyg">
                            <div class="background"></div>
                            <div class="virtual" contenteditable="true" spellcheck="false"></div>
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
    }
    $(".back-btn-c").click(function(){
        flashcards = {};
        studySet = {};
        currentPage = "home";
        updatePage();
    });
    $(".study-set").click(function(){
        currentPage = "study";
        updatePage();
    });
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
        //return if flashcard is empty
        if($(".fronteditor .virtual").html().length == 0 || $(".backeditor .virtual").html().length == 0) return;

        let newUUID = "_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        flashcards[newUUID] = {front:$(".fronteditor .virtual").html(),back:$(".backeditor .virtual").html()};
        registerFlashcard(newUUID);
        $(".fronteditor .virtual, .backeditor .virtual").html("");
        saveStudySet();
    });
    $("body").get(0).style.setProperty("--cardlist-height", String($(".cardlist").height())+"px");
}
let studyProgress = {};
let mode = "spacedrepetition";
let currentBox = 0;
async function saveProgress(){
    console.log("Saving...");
    console.log(studyProgress);
    if(studySetID == null){
        console.log("ERROR: studySetID is null");
    }else{
        await updateDoc(doc(db, "progress", studySetID), {spacedRepetition:{currentBox:currentBox,boxes:studyProgress}});
        console.log("Saved!");
    }
}
async function getProgressSpacedRepetition(){
    const docRef = doc(db, "progress", studySetID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        studyProgress = docSnap.data().spacedRepetition.boxes;
        currentBox = docSnap.data().spacedRepetition.currentBox;
        return true;
    } else {
        // doc.data() will be undefined in this case
        console.log("No progress found.");
        studyProgress = {};
        currentBox = 0;
        return false;
    }
}
async function getProgressFlashcards(){
    const docRef = doc(db, "progress_flashcards", studySetID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        studyProgress = docSnap.data().flashcards;
        currentBox = null;
        return true;
    } else {
        // doc.data() will be undefined in this case
        console.log("No progress found.");
        studyProgress = {};
        currentBox = null;
        return false;
    }
}
async function showLoaderAtElement(el,noopacityanim = false){
    let uuid = "_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let appendable = $(`<div class="loader-c" id="loader${uuid}"><div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>`)[0];
    //position loader on top of element by appending it to body
    $("body").append(appendable);
    let rect = el.getBoundingClientRect();
    $(appendable).css("top",String(rect.top)+"px");
    $(appendable).css("left",String(rect.left)+"px");
    $(appendable).css("width",String(rect.width)+"px");
    $(appendable).css("height",String(rect.height)+"px");
    gsap.fromTo(appendable, {opacity: 0}, {opacity: 1, duration: 0.5, ease: "power2.out"});
    if(!noopacityanim)
    gsap.to(el,{opacity:0,duration:0.5,ease:"power2.out"});
    loaders.push(appendable);
    loadingElements.push(el);
    return appendable;
}

async function removeAllLoaders(){
    for(let i = 0;i < loaders.length;i++){
        gsap.fromTo(loaders[i], {opacity: 1}, {opacity: 0, duration: 0.5, ease: "power2.out"});
    }
    for(let i = 0;i < loadingElements.length;i++){
        gsap.to(loadingElements[i],{opacity:1,duration:0.5,ease:"power2.out"});
    }
    setTimeout(async ()=>{
        for(let i = 0;i < loaders.length;i++){
            loaders[i].remove();
        }
        loaders = [];loadingElements = [];
    },500);
}

async function showStudy(){
    let el = $(`<section>
    <h1>Study Set</h1>
    <div class="study-select">
        <div class="card">
            <div class="card-item"><h1>Study using:</h1></div>
            <div class="card-item"><button class="nozoom spaced-repetition">Spaced Repetition</button></div>
            <div class="card-item"><button class="nozoom study-using-cards">Cards</button></div>
        </div>
    </div>
</section>`)[0];
    $(".c").html(el);
    $(".spaced-repetition").click(function(){
        currentPage = "spacedrepetition";
        updatePage();
    });
    $(".study-using-cards").click(function(){
        currentPage = "studyusingcards";
        updatePage();
    });
}
async function partitionIntoBoxes(f){
    let boxes = {};
    let boxSize = 15;
    let boxCount = Math.ceil(f.length/boxSize);
    for(let i = 0;i < boxCount;i++){
        boxes[i] = [];
    }
    for(let i = 0;i < f.length;i++){
        boxes[Math.floor(i/boxSize)].push({id:f[i],status:-1});
    }
    return boxes;
}
async function showSpacedRepetition(){
    let el = $(`<section class="studying">
    <div class="progress-c">
        <div class="progress">
            <div class="active-indicator"></div>
            <div class="perfect-pills"></div>
        </div>
    </div>
    <div class="deck">
        <div class="card">
            <div class="card-item"><span class="card-side">Front Placeholder</span></div>
        </div>
    </div>
    <div class="buttons">
        <button class="button destroy">Hard</button>
        <button class="button warning">Ok</button>
        <button class="button ok">Easy</button>
    </div>
</section>`)[0];
    mode = "spacedrepetition";
    $(".c").html(el);
    showLoaderAtElement($(".studying")[0]);
    let f = Object.keys(studySet.flashcards);
    let existFlashcards = {};
    for(let i in f){
        existFlashcards[f[i]]=true;
    }
    async function resetProgress(){
        console.log("Creating new progress...")
        studyProgress = await partitionIntoBoxes(f);
        await setDoc(doc(db, "progress", studySetID), {spacedRepetition:{currentBox:0,boxes:studyProgress}});
    }
    if(!await getProgressSpacedRepetition()){ //first time use
        await resetProgress();
    }
    if(currentBox >= Object.keys(studyProgress).length){ //reset progress if problem
        await resetProgress();
        showSpacedRepetition();
        return;
    }
    console.log(studyProgress,existFlashcards,studySet);
    //remove non-existant flashcards
    for(let i = 0;i < Object.keys(studyProgress).length;i++){
        for(let j = 0;j<studyProgress[i].length;j++){
            if(!(studyProgress[i][j].id in existFlashcards)){
                studyProgress[i].splice(j,1);
            }
        }
    }
    //add new flashcards
    let existsInProgress = {};
    for(let i = 0;i < Object.keys(studyProgress).length;i++){
        for(let j = 0;j<studyProgress[i].length;j++){
            existsInProgress[studyProgress[i][j].id]=true;
        }
    }
    for(let i = 0;i < f.length;i++){
        if(!(f[i] in existsInProgress)){
            let lastBoxLength = studyProgress[Object.keys(studyProgress).length-1].length;
            if(lastBoxLength >= 15)
                studyProgress[Object.keys(studyProgress).length] = [{id:f[i],status:-1}];
            else
                studyProgress[Object.keys(studyProgress).length-1].push({id:f[i],status:-1});
        }        
    }
    await saveProgress();
    removeAllLoaders();
    async function createProgressBar(){
        $(".studying .progress").html(`<div class="active-indicator"></div><div class="perfect-pills hidden"></div>`);
        let boxCount = studyProgress[currentBox].length;
        let firstPill = null;
        for(let i = 0;i < boxCount;i++){
            let s = studyProgress[currentBox][i].status;
            let el = $(`<div class="pill" id="pill_${studyProgress[currentBox][i].id}"></div>`)[0];
            if(s == -1){}else if(s == 0){
                $(el).addClass("hard");
            }else if(s == 1){
                $(el).addClass("ok");
            }else if(s == 2){
                $(el).addClass("easy");
            }else if(s == 3){
                $(el).addClass("perfect");
            }
            if(s==3)
                $(".studying .progress .perfect-pills").append(el).removeClass("hidden");
            else
                $(".studying .progress").append(el);
            if(i==0) firstPill = el;
        }
        $(firstPill).addClass("active");
        gsap.to(".active-indicator",{duration:0,ease:"power4.out",left:$(firstPill).position().left-10,width:$(firstPill).width()+20,height:$(firstPill).height()+20,top:$(firstPill).position().top-10});
    }
    await createProgressBar();
    let currentCardKey = studyProgress[0][0].id;
    let flipped = false;
    $(".studying .deck .card").click(function(){
        //flip card
        flipped = !flipped;
        if(flipped){
            let tl = gsap.timeline();
            tl.fromTo($(this),{rotationY:0},{duration:0.2,ease:"power2.in",rotationY:90});
            tl.call(()=>{$(this).find(".card-side").html(studySet.flashcards[currentCardKey].back)});
            tl.fromTo($(this),{rotationY:-90},{duration:0.3,ease:"power2.out",rotationY:0});
        }else{
            let tl = gsap.timeline();
            tl.fromTo($(this),{rotationY:0},{duration:0.2,ease:"power2.in",rotationY:90});
            tl.call(()=>{$(this).find(".card-side").html(studySet.flashcards[currentCardKey].front)});
            tl.fromTo($(this),{rotationY:-90},{duration:0.3,ease:"power2.out",rotationY:0});
        }
    });
    async function showFc(){
        $(".studying .deck .card").find(".card-side").html(studySet.flashcards[currentCardKey].front);
    }
    async function finishDeck(){
        console.log("Finished");
        let el = $(`<section class="studying">
        <div class="deck">
            <div class="card">
                <h1>Finished!</h1>
                <div class="card-item"><button class="nozoom close-study-gui">Go Back</button></div>
            </div>
        </div>
    </section>`)[0];
        $(".c").html(el);
        $(".close-study-gui").click(function(){
            currentPage = "home";
            updatePage();
        });

    }
    async function nextBoxCheck(_cardsStillNotPerfect){
        if(_cardsStillNotPerfect == 0){
            currentBox++;
            if(currentBox >= Object.keys(studyProgress).length){
                await resetProgress();
                finishDeck();
                return true;
            }
        }
        return false;
    }
    $(".studying .buttons .ok").click(async function(){ //EASY
        flipped = false;
        //move flashcard to the back of studyProgress
        let splicePos = 0;
        let cardsStillNotPerfect = 0;
        for(let i = 0;i < studyProgress[currentBox].length;i++){
            splicePos++;
            if(studyProgress[currentBox][i].status < 3){
                cardsStillNotPerfect++;
            }
            if(cardsStillNotPerfect >= 1){
                break;
            }
        }
        for(let i = 0;i<splicePos;i++){
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        console.log(studyProgress);
        //update progress
        let _status = studyProgress[currentBox][studyProgress[currentBox].length-1].status;
        if(_status == -1){
            studyProgress[currentBox][studyProgress[currentBox].length-1].status = 1;
        }else if(_status < 3){
            studyProgress[currentBox][studyProgress[currentBox].length-1].status++;
        }
        //update currentCardKey
        currentCardKey = studyProgress[currentBox][0].id;
        let _cardsStillNotPerfect = 0;
        for(let i = 0;i < studyProgress[currentBox].length;i++){
            if(studyProgress[currentBox][i].status < 3){
                _cardsStillNotPerfect++;
            }
        }
        //animate progress bar
        let firstPill = $(".studying .progress > .pill").eq(0);
        let firstPillPos = $(firstPill).position();
        let firstPillWidth = $(firstPill).width();
        let firstPillHeight = $(firstPill).height();
        let lastPillPos  = $(".studying .progress > .pill").eq(-1).position();

        firstPill.removeClass("hard");
        firstPill.removeClass("ok");
        if(studyProgress[currentBox][studyProgress[currentBox].length-1].status == 3){
            firstPill.removeClass("easy");
            firstPill.addClass("perfect");
        }else{
            //second pill
            $(".studying .progress > .pill").eq(1).css("margin-left",String(firstPillWidth+20)+"px");
            firstPill.css("width",String(firstPillWidth)+"px");
            $(".studying .progress > .pill").eq(-1).css("margin-right","0px");
    
            firstPill.css("position","absolute");
            gsap.fromTo(firstPill,firstPillPos,{duration:0.5,ease:"power4.inOut",left:lastPillPos.left,width:firstPillWidth,height:firstPillHeight,top:lastPillPos.top});
            gsap.to($(".studying .progress > .pill").eq(1)[0],{duration:0.5,marginLeft:0,ease:"power4.inOut"});
            gsap.to($(".studying .progress > .pill").eq(-1)[0],{duration:0.5,marginRight:firstPillWidth+20,ease:"power4.inOut"});
            if(studyProgress[currentBox][studyProgress[currentBox].length-1].status == 1)
                firstPill.addClass("ok");
            else
                firstPill.addClass("easy");
        }
        setTimeout(async ()=>{await createProgressBar()},500);
        while((studyProgress[currentBox][0].status == 3) && (_cardsStillNotPerfect > 0)){
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        if(await nextBoxCheck(_cardsStillNotPerfect)) return;
        await saveProgress();
        await showFc();
    });

    $(".studying .buttons .warning").click(async function(){ //OK
        flipped = false;
        //move flashcard to the back of studyProgress
        let splicePos = 0;
        let cardsStillNotPerfect = 0;
        for(let i = 0;i < studyProgress[currentBox].length;i++){
            splicePos++;
            if(studyProgress[currentBox][i].status < 3){
                cardsStillNotPerfect++;
            }
            if(cardsStillNotPerfect >= 1){
                break;
            }
        }
        for(let i = 0;i<splicePos;i++){
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        console.log(studyProgress);
        //update progress
        studyProgress[currentBox][studyProgress[currentBox].length-1].status = 1;
        //update currentCardKey
        currentCardKey = studyProgress[currentBox][0].id;
        let _cardsStillNotPerfect = 0;
        for(let i = 0;i < studyProgress[currentBox].length;i++){
            if(studyProgress[currentBox][i].status < 3){
                _cardsStillNotPerfect++;
            }
        }
        //animate progress bar
        let firstPill = $(".studying .progress > .pill").eq(0);
        let firstPillPos = $(firstPill).position();
        let firstPillWidth = $(firstPill).width();
        let firstPillHeight = $(firstPill).height();
        let lastPillPos  = $(".studying .progress > .pill").eq(-1).position();
        //second pill
        $(".studying .progress > .pill").eq(1).css("margin-left",String(firstPillWidth+20)+"px");
        firstPill.css("width",String(firstPillWidth)+"px");
        $(".studying .progress > .pill").eq(-1).css("margin-right","0px");

        firstPill.css("position","absolute");
        gsap.fromTo(firstPill,firstPillPos,{duration:0.5,ease:"power4.inOut",left:lastPillPos.left,width:firstPillWidth,height:firstPillHeight,top:lastPillPos.top});
        gsap.to($(".studying .progress > .pill").eq(1)[0],{duration:0.5,marginLeft:0,ease:"power4.inOut"});
        gsap.to($(".studying .progress > .pill").eq(-1)[0],{duration:0.5,marginRight:firstPillWidth+20,ease:"power4.inOut"});
        firstPill.removeClass("easy");
        firstPill.removeClass("hard");
        firstPill.addClass("ok");
        setTimeout(async ()=>{await createProgressBar()},500);
        while((studyProgress[currentBox][0].status == 3) && (_cardsStillNotPerfect > 0)){
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        if(await nextBoxCheck(_cardsStillNotPerfect)) return;
        await saveProgress();
        await showFc();
    });

    $(".studying .buttons .destroy").click(async function(){ //Hard
        flipped = false;
        //update progress
        studyProgress[currentBox][0].status = 0;
        //move flashcard to the 4th position of studyProgress
        if(studyProgress[currentBox].length >= 4){
            let s = studyProgress[currentBox].splice(0,1)[0];
            let splicePos = 0;
            let cardsStillNotPerfect = 0;
            for(let i = 0;i < studyProgress[currentBox].length;i++){
                splicePos++;
                if(studyProgress[currentBox][i].status < 3){
                    cardsStillNotPerfect++;
                }
                if(cardsStillNotPerfect >= 3){
                    break;
                }
            }

            studyProgress[currentBox].splice(splicePos,0,s);
        }else{
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        console.log(studyProgress);
        //update currentCardKey
        currentCardKey = studyProgress[currentBox][0].id;
        //animate progress bar
        let firstPill = $(".studying .progress > .pill").eq(0);
        let firstPillPos = $(firstPill).position();
        let firstPillWidth = $(firstPill).width();
        let firstPillHeight = $(firstPill).height();
        let pillToWarpTo = -1;
        let _cardsStillNotPerfect = 0;
        for(let i = 0;i < studyProgress[currentBox].length;i++){
            if(studyProgress[currentBox][i].status < 3){
                _cardsStillNotPerfect++;
            }
        }
        if(_cardsStillNotPerfect >= 4){
            pillToWarpTo = 3;
        }
        let lastPillPos = $(".studying .progress > .pill").eq(pillToWarpTo).position();
        
          
        //second pill
        $(".studying .progress > .pill").eq(1).css("margin-left",String(firstPillWidth+20)+"px");
        firstPill.css("width",String(firstPillWidth)+"px");
        $(".studying .progress > .pill").eq(pillToWarpTo).css("margin-right","0px");

        firstPill.css("position","absolute");
        gsap.fromTo(firstPill,firstPillPos,{duration:0.5,ease:"power4.inOut",left:lastPillPos.left,width:firstPillWidth,height:firstPillHeight,top:lastPillPos.top});
        gsap.to($(".studying .progress > .pill").eq(1)[0],{duration:0.5,marginLeft:0,ease:"power4.inOut"});
        gsap.to($(".studying .progress > .pill").eq(pillToWarpTo)[0],{duration:0.5,marginRight:firstPillWidth+20,ease:"power4.inOut"});
        firstPill.removeClass("easy");
        firstPill.removeClass("ok");
        firstPill.addClass("hard");
        setTimeout(async ()=>{await createProgressBar()},500);
        while((studyProgress[currentBox][0].status == 3) && (_cardsStillNotPerfect > 0)){
            let s = studyProgress[currentBox].splice(0,1)[0];
            studyProgress[currentBox].push(s);
        }
        if(await nextBoxCheck(_cardsStillNotPerfect)) return;
        await saveProgress();
        await showFc();
    });
    showFc();
    // console.log(currentCardKey)
}
async function saveProgressFlashcard(){
    console.log("Saving...");
    console.log(studyProgress);
    if(studySetID == null){
        console.log("ERROR: studySetID is null");
    }else{
        await updateDoc(doc(db, "progress_flashcards", studySetID), {flashcards:studyProgress});
        console.log("Saved!");
    }

}
async function showFlashcardStudyMode(){
    mode = "flashcards";
    let el = $(`
    <section class="studying">
        <div class="progress-c">
            <div class="progress-bar">
                <div class="easy"></div>
                <div class="ok"></div>
                <div class="hard"></div>
            </div>
        </div>
        <div class="deck">
            <div class="card">
                <div class="card-item"><span class="card-side">Front Placeholder</span></div>
            </div>
        </div>
        <div class="buttons">
            <button class="button destroy">Hard</button>
            <button class="button warning">Ok</button>
            <button class="button ok">Easy</button>
        </div>
    </section>`)[0];
    $(".c").html(el);
    showLoaderAtElement($(".studying")[0]);
    let f = Object.keys(studySet.flashcards);
    let existFlashcards = {};
    for(let i in f){
        existFlashcards[f[i]]=true;
    }
    async function resetProgress(){
        console.log("Creating new progress...")
        console.log("Checking if spaced repetition progress exists...");
        if(await getProgressSpacedRepetition()){
            console.log("Spaced repetition progress exists, copying...");
            let boxes = studyProgress;
            studyProgress = {};
            for(let i = 0;i < Object.keys(boxes).length;i++){
                for(let j = 0;j < boxes[i].length;j++){
                    studyProgress[boxes[i][j].id] = boxes[i][j];
                }
            }
            await setDoc(doc(db, "progress_flashcards", studySetID), {flashcards:studyProgress});
        }else{
            console.log("Spaced repetition progress does not exist, creating new progress...");
            studyProgress = {};
            for(let i = 0;i < f.length;i++){
                studyProgress[f[i]] = {id:f[i],status:-1};
            }
            await setDoc(doc(db, "progress_flashcards", studySetID), {flashcards:studyProgress});
        }
        console.log("Done!");
    }
    if(!await getProgressFlashcards()){ //first time use
        await resetProgress();
    }
    console.log({studyProgress:studyProgress,existFlashcards:existFlashcards,studySet:studySet});
    //remove non-existant flashcards
    for(let i = 0;i < Object.keys(studyProgress).length;i++){
        if(!(studyProgress[Object.keys(studyProgress)[i]].id in existFlashcards)){
            delete studyProgress[i];
        }
    }
    //add new flashcards
    let existsInProgress = {};
    for(let i = 0;i < Object.keys(studyProgress).length;i++){
        existsInProgress[studyProgress[Object.keys(studyProgress)[i]].id]=true;
    }
    for(let i = 0;i < f.length;i++){
        if(!(f[i] in existsInProgress)){
            studyProgress[f[i]] = {id:f[i],status:-1};
        }        
    }

    async function createProgressBar(){
        let easyPercent = 0;
        let okPercent = 0;
        let hardPercent = 0;
        let flashCardNumber = 0;
        Object.keys(studyProgress).forEach(k=>{
            let fc = studyProgress[k];
            if(fc.status == 0){
                hardPercent++;
            }else if(fc.status == 1){
                okPercent++;
            }else if(fc.status >= 2){
                easyPercent++;
            }
            flashCardNumber++;
        });
        easyPercent = easyPercent/flashCardNumber;
        okPercent = okPercent/flashCardNumber;
        hardPercent = hardPercent/flashCardNumber;
        gsap.to(".studying .progress-bar .easy",{width:String(easyPercent*100)+"%",duration:0.5,ease:"power4.out"});
        gsap.to(".studying .progress-bar .ok",{width:String(okPercent*100)+"%",duration:0.5,ease:"power4.out"});
        gsap.to(".studying .progress-bar .hard",{width:String(hardPercent*100)+"%",duration:0.5,ease:"power4.out"});
    }
    await createProgressBar();
    let currentCardKey = Object.keys(studyProgress)[0];
    let flipped = false;
    showFc();
    removeAllLoaders();

    $(".studying .deck .card").click(function(){
        //flip card
        flipped = !flipped;
        if(flipped){
            let tl = gsap.timeline();
            tl.fromTo($(this),{rotationY:0},{duration:0.2,ease:"power2.in",rotationY:90});
            tl.call(()=>{$(this).find(".card-side").html(studySet.flashcards[currentCardKey].back)});
            tl.fromTo($(this),{rotationY:-90},{duration:0.3,ease:"power2.out",rotationY:0});
        }else{
            let tl = gsap.timeline();
            tl.fromTo($(this),{rotationY:0},{duration:0.2,ease:"power2.in",rotationY:90});
            tl.call(()=>{$(this).find(".card-side").html(studySet.flashcards[currentCardKey].front)});
            tl.fromTo($(this),{rotationY:-90},{duration:0.3,ease:"power2.out",rotationY:0});
        }
    });
    async function showFc(){
        $(".studying .deck .card").find(".card-side").html(studySet.flashcards[currentCardKey].front);
    }

    $(".studying .buttons .ok").click(async function(){ //Easy
        flipped = false;
        //update progress
        if(studyProgress[currentCardKey].status == -1){
            studyProgress[currentCardKey].status = 2;
        }else if(studyProgress[currentCardKey].status == 0){
            studyProgress[currentCardKey].status = 1;
        }else if(studyProgress[currentCardKey].status == 1){
            studyProgress[currentCardKey].status = 2;
        }
        //update currentCardKey
        let keys = Object.keys(studyProgress);
        let currentIndex = keys.indexOf(currentCardKey);
        if(currentIndex+1 >= keys.length){
            currentCardKey = keys[0];
        }else{
            currentCardKey = keys[currentIndex+1];
        }
        console.log(currentCardKey,studyProgress,studyProgress[currentCardKey]);
        //animate progress bar
        await createProgressBar();
        await saveProgressFlashcard();
        await showFc();
    });

    $(".studying .buttons .warning").click(async function(){ //OK
        flipped = false;
        //update progress
        if(studyProgress[currentCardKey].status == -1){
            studyProgress[currentCardKey].status = 1;
        }else if(studyProgress[currentCardKey].status == 0){
            studyProgress[currentCardKey].status = 1;
        }else if(studyProgress[currentCardKey].status == 1){
            studyProgress[currentCardKey].status = 1;
        }
        //update currentCardKey
        let keys = Object.keys(studyProgress);
        let currentIndex = keys.indexOf(currentCardKey);
        if(currentIndex+1 >= keys.length){
            currentCardKey = keys[0];
        }else{
            currentCardKey = keys[currentIndex+1];
        }
        console.log(currentCardKey,studyProgress,studyProgress[currentCardKey]);
        //animate progress bar
        await createProgressBar();
        await saveProgressFlashcard();
        await showFc();
    });

    $(".studying .buttons .destroy").click(async function(){ //Hard
        flipped = false;
        //update progress
        studyProgress[currentCardKey].status = 0;
        //update currentCardKey
        let keys = Object.keys(studyProgress);
        let currentIndex = keys.indexOf(currentCardKey);
        if(currentIndex+1 >= keys.length){
            currentCardKey = keys[0];
        }else{
            currentCardKey = keys[currentIndex+1];
        }
        console.log(currentCardKey,studyProgress,studyProgress[currentCardKey]);
        //animate progress bar
        await createProgressBar();
        await saveProgressFlashcard();
        await showFc();
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
        case "study":
            showStudy();
            break;
        case "spacedrepetition":
            showSpacedRepetition();
            break;
        case "studyusingcards":
            showFlashcardStudyMode();
            break;
        default:
            showStudysets();
            break;
    }

}
async function importStudySetFromURL(url){
    // console.log(url)
    try{
        let set = JSON.parse(url);
        console.log(set);
        if(set.name == undefined || set.background == undefined || set.flashcards == undefined){
            showError("Invalid Flashcard Structure");
            return;
        }else{
            showLoaderAtElement($("body")[0],true);
            let docRef = await addDoc(collection(db, "studysets"), set);
            //remove from url
            let url = new URL(window.location.href);
            url.searchParams.delete("import");
            window.history.replaceState({}, document.title, url);
            removeAllLoaders();
        }
    }catch(e){
        showError(e);
        console.log(e);
        return;
    }
}
async function startApp(){
    //check if url is import url
    let url = new URL(window.location.href);
    let importUrl = url.searchParams.get("import");
    if(importUrl != null){
        await importStudySetFromURL(importUrl);
    }
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
        await openModal("<div class='inline-flex'>Enter your database json<button class='help'>?</button></div>",$(`<textarea></textarea>`)[0],$(`<button class="active big">OK</button>`)[0]);
        $(".help").click(()=>{
            //open new page
            window.open("/help","_blank");
        });
        $(".modal-c .modal .3 button").click(function(){
            try{
                // firebaseConfig = JSON.parse($(".modal-c .modal .2 textarea").val());
                eval(`window.firebaseConfig = ${$(".modal-c .modal ._2 textarea").val()}`);
                localStorage.setItem("db_id",JSON.stringify(window.firebaseConfig));
                connectToDB();
                $(".modal-c").addClass("hidden");
                
            }catch(e){
                showError(e);
            }
        });
    }
});