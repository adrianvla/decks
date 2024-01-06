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
function getTextBoundingRect(input, selectionStart, selectionEnd, debug) {
    // Basic parameter validation
    if(!input || !('value' in input)) return input;
    if(typeof selectionStart == "string") selectionStart = parseFloat(selectionStart);
    if(typeof selectionStart != "number" || isNaN(selectionStart)) {
        selectionStart = 0;
    }
    if(selectionStart < 0) selectionStart = 0;
    else selectionStart = Math.min(input.value.length, selectionStart);
    if(typeof selectionEnd == "string") selectionEnd = parseFloat(selectionEnd);
    if(typeof selectionEnd != "number" || isNaN(selectionEnd) || selectionEnd < selectionStart) {
        selectionEnd = selectionStart;
    }
    if (selectionEnd < 0) selectionEnd = 0;
    else selectionEnd = Math.min(input.value.length, selectionEnd);

    // If available (thus IE), use the createTextRange method
    if (typeof input.createTextRange == "function") {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart('character', selectionStart);
        range.moveEnd('character', selectionEnd - selectionStart);
        return range.getBoundingClientRect();
    }
    // createTextRange is not supported, create a fake text range
    var offset = getInputOffset(),
        topPos = offset.top,
        leftPos = offset.left,
        width = getInputCSS('width', true),
        height = getInputCSS('height', true);

        // Styles to simulate a node in an input field
    var cssDefaultStyles = "white-space:pre;padding:0;margin:0;",
        listOfModifiers = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing'];

    topPos += getInputCSS('padding-top', true);
    topPos += getInputCSS('border-top-width', true);
    leftPos += getInputCSS('padding-left', true);
    leftPos += getInputCSS('border-left-width', true);
    leftPos += 1; //Seems to be necessary

    for (var i=0; i<listOfModifiers.length; i++) {
        var property = listOfModifiers[i];
        cssDefaultStyles += property + ':' + getInputCSS(property) +';';
    }
    // End of CSS variable checks

    var text = input.value,
        textLen = text.length,
        fakeClone = document.createElement("div");
    if(selectionStart > 0) appendPart(0, selectionStart);
    var fakeRange = appendPart(selectionStart, selectionEnd);
    if(textLen > selectionEnd) appendPart(selectionEnd, textLen);

    // Styles to inherit the font styles of the element
    fakeClone.style.cssText = cssDefaultStyles;
    fakeClone.classList.add("measurement-element");

    // Styles to position the text node at the desired position
    fakeClone.style.position = "absolute";
    fakeClone.style.top = topPos + "px";
    fakeClone.style.left = leftPos + "px";
    fakeClone.style.width = width + "px";
    fakeClone.style.height = height + "px";
    document.body.appendChild(fakeClone);
    var returnValue = fakeRange.getBoundingClientRect(); //Get rect
    returnValue.compensate = {"bounds":fakeClone.getBoundingClientRect()};

    if (!debug) fakeClone.parentNode.removeChild(fakeClone); //Remove temp
    return returnValue;

    // Local functions for readability of the previous code
    function appendPart(start, end){
        var span = document.createElement("span");
        span.style.cssText = cssDefaultStyles; //Force styles to prevent unexpected results
        span.textContent = text.substring(start, end);
        fakeClone.appendChild(span);
        return span;
    }
    // Computing offset position
    function getInputOffset(){
        var body = document.body,
            win = document.defaultView,
            docElem = document.documentElement,
            box = document.createElement('div');
        box.style.paddingLeft = box.style.width = "1px";
        body.appendChild(box);
        var isBoxModel = box.offsetWidth == 2;
        body.removeChild(box);
        box = input.getBoundingClientRect();
        var clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
            scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
        return {
            top : box.top  + scrollTop  - clientTop,
            left: box.left + scrollLeft - clientLeft};
    }
    function getInputCSS(prop, isnumber){
        var val = document.defaultView.getComputedStyle(input, null).getPropertyValue(prop);
        return isnumber ? parseFloat(val) : val;
    }
}
async function registerVirtualTextarea(){
    $(".wysiwyg").each(function(){
        let el = $(this);
        async function updateCursor(){
            let startPos = el.find(".virtual").prop("selectionStart");
            let endPos = el.find(".virtual").prop("selectionEnd");
            let bound = getTextBoundingRect(el.find(".virtual")[0],startPos,endPos);
            gsap.to(el.find(".selection")[0],{x:bound.x - el.find(".virtual").offset().left,y:bound.y - el.find(".virtual").offset().top,width:bound.width,height:bound.height,duration:0.1,ease:"power4.out"});
        }
        function calculateCharWidth(ch){
            let tempEl = $("<div class='measurement-letter' style='pointer-events:none;opacity:0;position:absolute'>"+ch+"</div>");
            tempEl.css("font-size",el.find(".virtual").css("font-size"));
            tempEl.css("font-family",el.find(".virtual").css("font-family"));
            $("body").append(tempEl);
            let w = tempEl.width();
            tempEl.remove();
            return w;
        }
        let wacc = [0];
        let waccline = 0;
        let inputFunc = function(e){
            let val = el.find("textarea").val();
            if(e.key == "Backspace"){
                wacc[waccline] -= calculateCharWidth(val[val.length-1]);
                if(wacc[waccline] < 0){
                    console.log("LESS THAN 0")
                    wacc[waccline] = 0;
                    if(waccline > 0)
                    {
                        console.log("POPPING")
                        waccline--;
                        wacc.pop();
                    }
                }
            }
            if(e.key == "Enter"){
                waccline++;
                wacc.push(0);
            }
            if(e.key.length == 1){
                wacc[waccline] += calculateCharWidth(e.key);
            }
            if(wacc[waccline] > el.find("textarea").width()){
                val += "\n";
                waccline++;
                wacc.push(0);
            }
            console.log(wacc)
            // let wacc = 0;
            // const val_length = val.length;
            // const textarea_width = el.find("textarea").width();
            // // console.log(val_length,textarea_width)
            // for(let i = 0;i<val_length;i++){
            //     let charwidth = calculateCharWidth(val[i]);
            //     wacc += charwidth;
            //     if(val[i] == "\n") wacc=0;
            //     // console.log("CHARWIDTH:",charwidth)
            //     if(wacc > textarea_width){
            //         val = val.substring(0,i) + "\n" + val.substring(i);
            //         wacc = 0;
            //     }
            // }
            console.log(val)
            el.find("textarea").val(val);
            el.find(".virtual-textarea").html(val);
            let tempEl = $("<div style='hidden measurement-element' style='pointer-events:none;display:none;opacity:0'>"+val.replaceAll("\n","<br>")+"<br></div>");
            tempEl.css("font-size",el.find(".virtual").css("font-size"));
            tempEl.css("font-family",el.find(".virtual").css("font-family"));
            tempEl.css("width",String(el.find("textarea").width()) + "px");
            $("body").append(tempEl);
            let h = tempEl.height();
            tempEl.remove();
            gsap.to(el.find(".virtual")[0],{duration:0.1,ease:"power4.out",height:h});
            gsap.to(el.find(".virtual-textarea")[0],{duration:0.1,ease:"power4.out",height:el.find(".virtual").height()+15});
            updateCursor();
        };
        inputFunc({key:"Backspace"});
        // el.on("input",inputFunc);
        el.on("keydown",inputFunc);
        el.on("keyup",updateCursor);
        let mousedown = false;
        el.on("mousedown",function(){
            mousedown = true;
        });
        el.on("mouseup",function(){
            mousedown = false;
        });
        el.on("mousemove",function(){
            if(mousedown)
                updateCursor();
        });
        el.on("click",()=>{
            updateCursor();
        });
    });
}
$(document).ready(registerVirtualTextarea);
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
    registerVirtualTextarea();
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