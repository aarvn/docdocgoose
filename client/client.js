var currDocObj = []; //The JSON object of the currently selected document
var currentTemplate = ""; // e.g. ["nda"] - used for creating a new document from template

/// UI FUNCTIONS INITIALISATION - START ///
//Navigation menu
$("#new").addClass("main-section-active");
$("#sidebar-new").addClass("sidebar-btn-active");

$(".sidebar-btn").click(function(){
    //Change button styling                
    $(".sidebar-btn").removeClass("sidebar-btn-active");
    $(this).addClass("sidebar-btn-active");

    //Change section styling
    $(".main-section").removeClass("main-section-active");
    $("#"+this.dataset.section).addClass("main-section-active");

    //Close document-editor
    $("#document-editor").removeClass("document-editor-active");

    //Close new template editor
    $("#new-template-editor").removeClass("new-template-editor-active");
});

//Close document-editor button
$(".close-document-editor-btn").click(function(){
    $("#document-editor").removeClass("document-editor-active");
});

$("#new-template-editor-close-btn").click(function(){ 
    $("#new-template-editor").removeClass("new-template-editor-active");
});

//Export document
//Courtesy of Bill Paetzke https://stackoverflow.com/questions/2255291/print-the-contents-of-a-div
$("#export-btn").click(function(){ 
    var mywindow = window.open('', 'PRINT', 'height='+$(window).height()/2+',width='+$(window).width()/2);

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1 style = "text-align:center">' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById("document-editor-output").innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    //mywindow.close();

    return true;
});
/// UI FUNCTIONS INITIALISATION - END ///




/// TEMPLATE THUMBNAILS - START ///
async function updateTemplateThumbnails(){
    try{
        //Get array of templates' JSON of each class
        let officialTemplates = await fetch('http://127.0.0.1:8090/officialTemplates');
        officialTemplates = await officialTemplates.text();
        officialTemplates = JSON.parse(officialTemplates);

        //Inject the HTML made from those template objects
        $("#new-templates-official").html( generateTemplateThumbnailsHTML(officialTemplates.data) );

        //Thumbnail click
        $(".template-thumbnail").click(function(){
            $("#new-template-editor").addClass("new-template-editor-active");
            currentTemplate = $(this).data("template-name");
            $("#new-template-editor").find("h2").html( $(this).data("template-name") ); //Update title of the template editor
        });
    } catch(err) {
        DisconnectedFromServer();
    }
}
updateTemplateThumbnails();


//Generate the HTML for the template thumbnails
function generateTemplateThumbnailsHTML(templates){
    var ret = "";
    for(var i = 0; i < templates.length; i ++){
        ret +=`<div class = "file-thumbnail template-thumbnail" data-template-class = "`+templates[i].class+`" data-template-type = "`+templates[i].type+`" data-template-name = "`+templates[i].name+`">
                    <div class = "file-thumbnail-left">
                        <img src = "images/icon-template-thumbnail-shadow.png">
                        <div>
                            <h3>`+templates[i].name+`</h3>
                        </div>
                    </div>
                </div>
                <div class = "horiz-line"></div>` 
    }
    return ret;
}




/// DOCUMENT THUMBNAILS - START ///
async function updateDocumentThumbnails(){  
    try{
        //Get array of templates' JSON of each class
        let documents = await fetch('http://127.0.0.1:8090/documents/');
        documents = await documents.text();
        documents = JSON.parse(documents);

        $("#open-documents").html( generateDocumentThumbnailsHTML(documents.data) );

        $(".document-thumbnail-left").click(function(){
            $("#document-editor").addClass("document-editor-active");
            openDocument( $(this).data("document-name") );
        });     
   
    } catch(err) {
        DisconnectedFromServer();
    }
}
updateDocumentThumbnails();

function generateDocumentThumbnailsHTML(documents){
    var ret = "";
    for(var i = 0; i < documents.length; i ++){
        ret +=`<div class = "file-thumbnail">
                    <div class = "file-thumbnail-left document-thumbnail-left" data-document-name = "`+documents[i].name+`">
                        <img src = "images/icon-template-thumbnail-shadow.png">
                        <div>
                            <h3>`+documents[i].name+`</h3>
                            <h4> Type: `+camelCaseToSentenceCase(documents[i].class)+`/`+documents[i].type+`</h4>
                            <h4>`+documents[i].dateModified+`</h4>
                        </div>
                    </div>
                    <div class = "file-thumbnail-right" onclick = "$(this).siblings('.file-thumbnail-overlay').addClass('file-thumbnail-overlay-active');">
                        <img src = "images/icon-trash.png">
                    </div>
                    <div class = "file-thumbnail-overlay">
                        <h3>Are you sure?</h3>
                        <div>
                            <div class = "btn">
                                <h4 onclick = "deleteDocument('`+documents[i].name+`')">Yes</h4>
                            </div>
                            <div class = "btn" onclick = "$(this).parent().parent().removeClass('file-thumbnail-overlay-active')">
                                <h4>No</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div class = "horiz-line"></div>` 
    }
    return ret
}
/// DOCUMENT THUMBNAILS - END ///




/// DOCUMENT C.R.U.D. FUNCTIONS - START ///
function createDocumentFromTemplate(documentName, templateName){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8090/documents/createDocument/"+documentName+'/'+templateName, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            updateDocumentThumbnails();
            currDocObj = xhr.responseText;
            openDocument(documentName);
        }
    }
    xhr.ontimeout = function(){
        DisconnectedFromServer();
    }
}
$("#new-document-btn").click(function(){
    createDocumentFromTemplate($("#new-document-name").val(), currentTemplate);
});


async function openDocument(documentName){
    try{
        let document = await fetch('http://127.0.0.1:8090/documents/'+documentName);
        document = await document.text();
        currDocObj = JSON.parse(document).data;
        //Set up editor
        editorFormCount = 1;
        traverseForm(0); //To initialise the colour of the traversal buttons
        $("#editor-form").html( generateFormHTML(currDocObj, 1) );
        $("#document-editor-output").html( generateOutputHTML(currDocObj) );
        $("#document-editor").addClass("document-editor-active");
        
    } catch(err) {
        DisconnectedFromServer();
        //alert("Document could not be opened as you are disconnected from the server."); //err
    }
}

function updateDocument(document){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8090/documents/updateDocument/"+document.name, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(document));
}

function deleteDocument(documentName){
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "http://127.0.0.1:8090/documents/deleteDocument/"+documentName, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            updateDocumentThumbnails();
        }
    }
    xhr.ontimeout = function(){
        DisconnectedFromServer();
    }
}
/// DOCUMENT C.R.U.D. FUNCTIONS - START ///




/// UPDATE FORM AND OUTPUT - START ///
var editorFormCount = 1;
document.getElementById("continue-btn").addEventListener('click', function(){ 
    updateDocument(currDocObj);
    traverseForm(1);
}, false);
document.getElementById("back-btn").addEventListener('click', function(){ 
    updateDocument(currDocObj);
    traverseForm(-1); 
}, false);
$("#exit-btn").click(function(){
    updateDocument(currDocObj);
    updateDocumentThumbnails();
});
$(".sidebar-btn").click(function(){
    if(Object.entries(currDocObj).length != 0){
        updateDocument(currDocObj);
        updateDocumentThumbnails();
    }
});

function traverseForm(dir){
    editorFormCount+=dir;
    editorFormCount = Math.min(Math.max(parseInt(editorFormCount), 1), Object.keys(currDocObj.forms).length);
    $("#editor-form").html( generateFormHTML(currDocObj, editorFormCount) );

    //Button styling
    document.getElementById("back-btn").classList.remove("btn-disabled");
    document.getElementById("continue-btn").classList.remove("btn-disabled");
    if(editorFormCount == 1){
        document.getElementById("back-btn").classList.add("btn-disabled");
    }
    if(editorFormCount == Object.keys(currDocObj.forms).length){
        document.getElementById("continue-btn").classList.add("btn-disabled");
    }
}

function generateFormHTML(document, count){
    var form = document.forms[count];
    var vars = document.vars;
    var retHTML = "";
    for(var field in form){
        var _field = form[field];
        retHTML += '<input class = "form-input" type = "text" placeholder = "'+camelCaseToSentenceCase(_field)+'" name = "'+_field+'" value = "'+vars[_field]+'" onkeyup = "onFormChange(this)" onkeypress="return blockSpecialChar(event)"></input>'; //onkeyup = "postFormData()"></input>';
    }
    return retHTML;
}

//Courtesy of Rahul Tripathi - https://stackoverflow.com/questions/24774367/how-to-validate-html-textbox-not-to-allow-special-characters-and-space
function blockSpecialChar(e){
    var k;
    document.all ? k = e.keyCode : k = e.which;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
}

function onFormChange(input){
    //Update document JSON object
    currDocObj.vars[input.name] = input.value;
    //Update output
    $("#document-editor-output").html( generateOutputHTML(currDocObj) );
}

function generateOutputHTML(document){
    var templateHTML = document.template;
    var regExp = /\[\*.*?\*\]/g;
    var result;
    while((result = regExp.exec(templateHTML)) !== null) {
        var replace = '\\[\\*' + String(result[0]).slice(2,-2) + '\\*\\]';
        var re = new RegExp(replace,"g");
        var varHTML = "";
        if(document.vars[result[0].slice(2,-2)] == ""){
            varHTML = '<span class = "varField" id = "' + result[0].slice(2,-2) + '">'+ camelCaseToSentenceCase(result[0].slice(2,-2)) +'</span>'; 
        }
        else{
            varHTML = '<span class = "varField varFieldUpdated" id = "' + result[0].slice(2,-2) + '">'+ document.vars[result[0].slice(2,-2)] +'</span>'; 
        }
        templateHTML = templateHTML.replace(re, varHTML);
    }
    return "<div class = 'output-text-container'><h3>"+document.name+"</h3><p>"+templateHTML+"</p></div>";
}
/// UPDATE FORM AND OUTPUT - END ///




// /HELPER FUNCTIONS - START ///
function camelCaseToSentenceCase(str){
    var spaced = str.replace( /([A-Z])/g, " $1" );
    var result = spaced.charAt(0).toUpperCase() + spaced.slice(1);
    return result;
}

function DisconnectedFromServer(){
    $("#main").html(`
    <div class = 'disconnectedFromServer'>
        <div class = 'inner'>
            <h2>Oops!</h2>
            <p>You are no longer connected to the server.</p>
            <div class = 'btn' onClick='window.location.reload();'>Try Again</div>
        </div>
    </div>`);
}
/// HELPER FUNCTIONS - END ///







//TESTING START!!!!
/*
console.log("okosakdpoas");

function testUserPost(username){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8090/users", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var data = {
        username: username,
        password: "me man",
        email: "okii"
    }
    console.log(JSON.stringify(data));
    xhr.send(JSON.stringify(data));


    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log("donezo");
        }
    }
}
testUserPost("nizno");


function testOfficialTemplatePost(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8090/officialTemplates", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var data = {
        "name": "Offical Template XO",
        "type": "will",
        "class": "official",
        "dateModified": "",
        "vars": {
            "effectiveDate": "",
            "p1Name": "",
            "p1Address": "",
            "p2Name": "",
            "p2Address": "",
            "possessions": "",
            "issueAtHand": ""
        },
        "forms":{
            "1":["effectiveDate", "p1Name", "p1Address"],
            "2":["p2Name", "p2Address"],
            "3":["issueAtHand", "possessions"]
        },
        "template": "As of [*effectiveDate*] (the 'Effective Date'), it is declared that the following possessions [*possessions*] of [*p1Name*] (the 'Deceased') of [*p1Address*] will have their legal possession passed on to [*p2Name*] (the 'Recipient') of [*p2Address*] on the condition that [*p2Name*] resolves [*issueAtHand*]."
    }
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log("donezo");
        }
    }
}
//testOfficialTemplatePost();
//testOfficialTemplatePost();

{
    "name": "Offical Template X",
    "type": "will",
    "class": "official",
    "dateModified": "",
    "vars": {
        "effectiveDate": "",
        "p1Name": "",
        "p1Address": "",
        "p2Name": "",
        "p2Address": "",
        "possessions": "",
        "issueAtHand": ""
    },
    "forms":{
        "1":["effectiveDate", "p1Name", "p1Address"],
        "2":["p2Name", "p2Address"],
        "3":["issueAtHand", "possessions"]
    },
    "template": "As of [*effectiveDate*] (the 'Effective Date'), it is declared that the following possessions [*possessions*] of [*p1Name*] (the 'Deceased') of [*p1Address*] will have their legal possession passed on to [*p2Name*] (the 'Recipient') of [*p2Address*] on the condition that [*p2Name*] resolves [*issueAtHand*]."
}*/
/*
async function testOfficialTemplatesGet(){
    try{
        //Get array of templates' JSON of each class
        let officialTemplates = await fetch('http://127.0.0.1:8090/officialTemplates');
        officialTemplates = await officialTemplates.text();
        officialTemplates = JSON.parse(officialTemplates);
        console.log(officialTemplates);
    } catch(err) {
        alert(err);
    }
}
//testOfficialTemplatesGet();

async function testOfficialTemplateGet(templateName){
    try{
        //Get array of templates' JSON of each class
        let officialTemplates = await fetch('http://127.0.0.1:8090/officialTemplates/'+templateName);
        officialTemplates = await officialTemplates.text();
        officialTemplates = JSON.parse(officialTemplates);
        console.log(officialTemplates);
    } catch(err) {
        alert(err);
    }
}
//testOfficialTemplateGet("Test");

async function testCustomTemplates(username){
    try{
        //Get array of templates' JSON of each class
        let user = await fetch('http://127.0.0.1:8090/customTemplates/'+username);
        user = await user.text();
        user = JSON.parse(user);
        console.log(user);
    } catch(err) {
        alert(err);
    }
}
testCustomTemplates(username);

async function testCustomTemplate(username, templateName){
    try{
        //Get array of templates' JSON of each class
        let user = await fetch('http://127.0.0.1:8090/customTemplates/'+username+'/'+templateName);
        user = await user.text();
        user = JSON.parse(user);
        console.log(user);
    } catch(err) {
        alert(err);
    }
}
testCustomTemplate(username, "Custom Template 1");

async function testDocumentsGet(username){
    try{
        //Get array of templates' JSON of each class
        let resp = await fetch('http://127.0.0.1:8090/documents/'+username);
        resp = await resp.text();
        resp = JSON.parse(resp);
        let documents = resp.documents;
        console.log(documents);
    } catch(err) {
        alert(err);
    }
}
//testDocumentsGet("nino");

async function testDocumentGet(username, documentName){
    try{
        //Get array of templates' JSON of each class
        let resp = await fetch('http://127.0.0.1:8090/documents/'+username+'/'+documentName);
        resp = await resp.text();
        resp = JSON.parse(resp);
        console.log(resp.document);
    } catch(err) {
        alert(err);
    }
}
//testDocumentGet("nino", "mongoose now doc");

function testCreateDocument(username, name, templateClass, type){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8090/documents/createDocument/'+username+'/'+name+'/'+templateClass+'/'+type, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log("donezo");
            console.log(xhr.responseText);
        }
    }
}
//testCreateDocument("nino", "googly", "official", "test");

function testCreateCustomTemplate(username){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8090/customTemplates/createCustomTemplate/'+username, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    var data = {
        "name": "Custom Template 1",
        "type": "templo",
        "class": "custom",
        "dateModified": "",
        "vars": {
            "var128": "",
            "var2": "",
            "var2x": ""
        },
        "forms":{
            "1":["var128", "var2"],
            "2":["var2x"]
        },
        "template": "WOW! [*var2x*], is followed by [*var128*]"
    }
    console.log(data);
    xhr.send(JSON.stringify(data));


    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.responseText);
        }
    }
}
testCreateCustomTemplate("nino");

function testCreateDocument(username, name, templateClass, type){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8090/documents/createDocument/'+username+'/'+name+'/'+templateClass+'/'+type, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log("donezo");
            console.log(xhr.responseText);
        }
    }
}
//testCreateDocument("nino", "gigy", "official", "test");

function testUpdateDocument(username, documentObj){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://127.0.0.1:8090/documents/updateDocument/'+username+'/'+documentObj.name, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(documentObj));

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log("donezo");
            console.log(xhr.responseText);
        }
    }
}
var data = {
    "name": "gigy",
    "type": "test",
    "class": "official",
    "dateModified": "03:04 - 17/03/2020",
    "vars": {
        "var1": "ffffddd",
        "var2": "",
        "varx": ""
    },
    "forms":{
        "1":["var1", "var2"],
        "2":["varx"]
    },
    "template": "WOW! [*varx*]"
}
//testUpdateDocument("nino", data);

function deleteDocument(username,documentName){
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "http://127.0.0.1:8090/documents/deleteDocument/"+username+'/'+documentName, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.responseText);
            //updateDocumentThumbnails(username);
        }
    }
}
//deleteDocument("nino", "mongoose now doc");

*/ //TESTING END!!!!