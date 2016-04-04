// installed on NEXUS 5-1
'use strict';
var app = {
    requirements: 0,
    image: null,
    encodedPic: null,
	imgOptions: null,
    runGetList: 0,
    runGetSingle: 0,
    fakeUUID: "ryan",
    stars: 1,
    uploadURL: "https://griffis.edumedia.ca/mad9022/reviewr/review/set/",
    downloadURL: "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/",
    downloadSingleURL: "https://griffis.edumedia.ca/mad9022/reviewr/review/get/",
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('DOMContentLoaded', this.onDomReady);
    },
    onDeviceReady: function(ev) {
        app.requirements++;
		console.log("Device is ready.");
		if (app.requirements === 2) {
			app.start();
		}
    },
    onDomReady: function(ev) {
        app.requirements++;
		console.log("DOM is ready.");
		if (app.requirements === 2) {
			app.start();
		}
    },
    start: function(ev) {
		app.image = document.querySelector("#image");
        
        var uploadButton = document.querySelector("#btnUpload");
        var uploadTap = new Hammer(uploadButton);
        uploadTap.on('tap', app.upload);

        var picButton = document.querySelector("#picBtn");
        var picTap = new Hammer(picButton);
        picTap.on('tap', app.callCamera);
        
        var listButton = document.querySelector("#listbtn");
        var listTap = new Hammer(listButton);
        listTap.on('tap', app.getList);
        
        var pl = document.querySelectorAll(".page-link");
        [].forEach.call(pl, function(obj, index){
            var navTap = new Hammer(obj);
            navTap.on('tap', app.navigate);
        });
        var pages = document.querySelectorAll("[data-role=page]");
        [].forEach.call(pages, function(obj, index){
            obj.className = "inactive-page"; 
            if(index==0){
                obj.className = "active-page";
            }
            obj.addEventListener("animationend", app.pageAnimated);
        });  
    },
    navigate: function(ev) {
        ev.preventDefault();
        var btn = ev.target;
        console.log("navigate function ran");
        console.log("target id: " + ev.target.id);
        console.log(ev);
        var href = btn.href;
        var id = href.split("#")[1];
        //history.pushState();
        var pages = document.querySelectorAll('[data-role="page"]');
        for(var p=0; p<pages.length; p++){
            if(pages[p].id === id){
                pages[p].classList.remove("hidden");
                if(pages[p].className !== "active-page"){
                    pages[p].className = "active-page";
                }
            }else{
                if(pages[p].className !== "inactive-page"){
                    pages[p].className = "inactive-page";
                }
            }
        }    
    },
    pageAnimated: function(ev) {
        var page = ev.target;
        if( page.className == "active-page" ){
        }else{
            ev.target.classList.add("hidden");
        }  
    },
    callCamera: function() {
		app.imgOptions = {
            quality : 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit : false,
            encodingType : Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth : 200,
            cameraDirection : Camera.Direction.FRONT,
            saveToPhotoAlbum : false,
            correctOrientation : true
           };
        navigator.camera.getPicture(app.imgSuccess, app.imgFail, app.imgOptions);
    },
	imgSuccess: function(imageData) {
        var picData = "data:image/jpeg;base64," + imageData;
        app.image.src = picData;
		console.log("Image loaded into interface");
        app.encodedPic = encodeURIComponent(picData);
		navigator.camera.cleanup();
	},
	imgFail: function(msg) {
		console.log("Failed to get image: " +  msg);
	},
    upload: function() {
        var radios = document.getElementsByName('rating');
        for (var i=0, length=radios.length; i<length; i++) {
            if (radios[i].checked) {
                app.stars = radios[i].value;
                break;
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", app.uploadURL);
        xhr.addEventListener("load", function(ev){
            console.log("upload connection success");
            console.log(ev.target.responseText);
            app.getList();
        });
        xhr.addEventListener("error", function(ev){
            console.log("upload error: " + ev.responseText);
        });
        var params = new FormData();
        params.append("uuid", device.uuid);
        //params.append("uuid", app.fakeUUID);
        params.append("action", "insert");
        params.append("title", document.getElementById("title").value);
        params.append("review_txt", document.getElementById("comments").value);
        params.append("rating", app.stars);
        params.append("img", app.encodedPic);
        xhr.send(params);
        
        console.log(device.uuid);
        console.log(document.getElementById("title").value);
        console.log(document.getElementById("comments").value);
        console.log(app.stars);
        console.log(app.encodedPic);
        
        console.log("upload function ran");
        //console.log(device.uuid);
        //console.log(app.fakeUUID);
        //app.getList();
    },
    getList: function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", app.downloadURL + "?" + "uuid=" + device.uuid);
        //xhr.open("POST", app.downloadURL + "?" + "uuid=" + app.fakeUUID);
        xhr.addEventListener("load", app.gotList);
        xhr.addEventListener("error", function(ev){
            console.log("error: " + ev.target.responseText);
        });
        xhr.send();
    },
    gotList: function (res) {
        console.log("got list connection success");
        var data = JSON.parse(res.target.responseText);
        console.log(JSON.stringify(data));
        if(app.runGetList > 0) {
            var myNode = document.getElementById("listHere");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }
        var listHere = document.getElementById("listHere");
        var ul = document.createElement("ul");
        console.log(data.reviews[0]);
        var reviewLength = data.reviews.length;
        console.log(reviewLength);
        if(reviewLength > 0 ){
            console.log("review list greater than zero");
            ul.id = "removeMe";
            listHere.appendChild(ul);
            for(var x=0; x < reviewLength; x++){
                var li = document.createElement("li");
                ul.appendChild(li);
                var link = document.createElement("a");
                link.setAttribute("href", "#singleReview");
                link.id = data.reviews[x].id;
                link.className = "item-link";
                li.appendChild(link);
                //link.innerHTML = "ID: " + data.reviews[x].id + " Title: " + data.reviews[x].title + " Rating: " + data.reviews[x].rating;
                link.innerHTML = "Title: " + data.reviews[x].title + " Rating: " + data.reviews[x].rating;
            }
        } else {
            console.log("error!" + data.code + data.message);
        }
        app.runGetList++;
        app.listItemHandlers();
    },
    getSingle: function(ev) {
        console.log("getSingle function ran");
        console.log(ev);
        if(app.runGetSingle > 0) {
            var myNode = document.getElementById("singleReviewHere");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }
        var id = ev.target.id;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", app.downloadSingleURL);
        xhr.addEventListener("load", function (evt) {
            var data = JSON.parse(evt.target.responseText);
            var article = document.getElementById("singleReviewHere");         
            var image = document.createElement("img");
            article.appendChild(image);
            image.src = decodeURIComponent(data.review_details.img);
            var ul = document.createElement("ul");
            var li = document.createElement("li");
            article.appendChild(ul);
            li.textContent = "Title: " + data.review_details.title;
            ul.appendChild(li);
            var li1 = document.createElement("li");
            li1.textContent = "Description: " + data.review_details.review_txt;
            ul.appendChild(li1);
            var li2 = document.createElement("li");
            li2.textContent = "Rating: " + data.review_details.rating;
            ul.appendChild(li2);
        });
        xhr.addEventListener("error", function(evt){
            console.log("error getting single list item");
        });
        var params = new FormData();
        params.append("uuid", device.uuid);
        //params.append("uuid", app.fakeUUID);
        params.append("review_id", id);
        xhr.send(params);
        app.runGetSingle++;
    },
    listItemHandlers: function(ev) {
        var pl = document.querySelectorAll(".item-link");
        [].forEach.call(pl, function(obj, index){
            var itemTap = new Hammer(obj);
            itemTap.on('tap', app.navigate);
            itemTap.on('tap', app.getSingle);
        });
    }
};

app.initialize();