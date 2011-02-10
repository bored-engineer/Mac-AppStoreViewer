//Var used for storing the last known hash of iframe "content"...
var prev_hash="";
//History Stash
var History=new Array();
//Current page the iframe is on relative to History
var History_Current_Index=0;

//Used for loading a page from a url
function loadpagefromurl(url,appendtohistory){
    //Check if the user is online...
    if(Titanium.Network.online){
        //Add page to "History" stack; (subtract 1 because javascript arrays start at 0)
        if(appendtohistory){
            //If a link is clicked after user has gone back remove pages in the future... (we can't have two futures)...
            History.splice(History_Current_Index+1,99999999999,url);
            //Set the current page index to be the last page in the stack....
            History_Current_Index=History.length-1;
        }
        //Hide the page during load so user does not see any weird anomalies...
        document.getElementById('content').style.visibility='hidden';
        //set initial status bar message
        document.getElementById('statusbar').innerHTML="Preparing to load...";
        //open the status bar
        document.getElementById('statusbar').style.display='block';
        //Set the prefix to be itunes.apple.com...
        var prefix='http://itunes.apple.com';
        //Create a http client to go get the page...
        var xhr = Titanium.Network.createHTTPClient();
        //Set the url to get to be th prefix + the passed url...
        xhr.open('GET', prefix+url);
        //Pretend to be the App Store
        xhr.setRequestHeader('User-Agent','MacAppStore/1.0 (Macintosh; U; Intel Mac OS X 10.6.6; en) AppleWebKit/533.19.4');
        //Set "X-Apple-Store-Front" to be "143441-1,13"... Is this the country code???
        xhr.setRequestHeader("X-Apple-Store-Front","143441-1,13");
        //Send the request to apple...
        xhr.send(null);
        //Wait for response...
        while(xhr.readyState != 4){
            document.getElementById('statusbar').innerHTML="Downloading: "+(xhr.dataReceived);
        }
        document.getElementById('statusbar').innerHTML="Drawing...";
        //Set data to be the response HTML...
        var data=xhr.responseText;
        //Set the iframe to the response data...
        document.getElementById('content').src=("data:text/html;base64,"+Titanium.Codec.encodeBase64(data));
    }else{
        //If user is offline show offline page...
        document.getElementById('content').src="app://Offline/index.html";
    }
}


//Run on page load
function onloadpage(){
    //Move the cursor to the search box
    document.getElementById('searchbox').focus();
    //Load the Fatured Page
    Featured_Load();
}


setInterval(function(){
    if(prev_hash!=document.getElementById('content').contentWindow.location.hash){
        //Set the previous hash to the current hash 
        prev_hash=document.getElementById('content').contentWindow.location.hash;
        //The substring(24) is to remove http://itunes.apple.com as it is auto appended later...
        //Stop infinite loop
        if(prev_hash.substring(24)!=''){
            loadpagefromurl(prev_hash.substring(24),true);
        }
    }
    //Update back and forward buttons
    
    //If user can go back
    if(History[History_Current_Index-1]){
        document.getElementById("Navigation_Back_IMG").src='Images/Navigation_Back_Selected.png';
    }else{
        document.getElementById("Navigation_Back_IMG").src='Images/Navigation_Back_Not_Selected.png';
    }
    //If user can go forward
    if(History[History_Current_Index+1]){
        document.getElementById("Navigation_Forward_IMG").src='Images/Navigation_Forward_Selected.png';
    }else{
        document.getElementById("Navigation_Forward_IMG").src='Images/Navigation_Forward_Not_Selected.png';
    }
},100);


function Navigation_Back(){
    //Check if it is possible to go back...
    if(History[History_Current_Index-1]){
        History_Current_Index=History_Current_Index-1;
        //Actually go back...
        loadpagefromurl(History[History_Current_Index],false);
    }
};


function Navigation_Forward(){
    //Check if it is possible to go forward...
    if(History[History_Current_Index+1]){
        History_Current_Index=History_Current_Index+1;
        //Actually go forward...
        loadpagefromurl(History[History_Current_Index],false);
    }
};


function onloadiframe(){
    document.getElementById('statusbar').innerHTML="Fixing links...";
    //for each link beggining with http://itunes.apple.com/ replace with properly formatted link...
    $("#content").contents().find('a[href^="http://itunes.apple.com/"]').each(function() {
        $(this).attr("href","javascript:window.location.hash=('"+$(this).attr("href")+"');");
    });
    document.getElementById('statusbar').innerHTML="Done!";
    //This will be how to replace prices when buying is implemented...
    //$("#content").contents().find("span.price").text('');
    //$("#content").contents().find("span.action").text('N/A');
    
    //Display fully loaded and edited content
    document.getElementById('content').style.visibility='visible';
    document.getElementById('statusbar').style.display='none';
}


function Search(){
    //Load search page....
    loadpagefromurl("/WebObjects/MZSearch.woa/wa/search?q="+escape(document.getElementById("searchbox").value),true);
}


function Categories_Load(){
    //Clear the "History" stash just like the real App Store does
    History=new Array();
    //Load the categories page... Does this URL change????
    loadpagefromurl('/us/genre/mac-app-store/id39',true);
}


function Featured_Load(){
    //Clear the "History" stash just like the real App Store does
    History=new Array();
    //Load the Featured page...
    loadpagefromurl('/WebObjects/MZStore.woa/wa/storeFront',true);
}


function Top_Charts_Load(){
    //Clear the "History" stash just like the real App Store does
    History=new Array();
    //Load the Top Charts page.... Does ?s change????
    loadpagefromurl('/WebObjects/MZStore.woa/wa/viewTopSummary?s=143441',true);
}