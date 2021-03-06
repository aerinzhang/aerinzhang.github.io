var currentPageID;
var timeDic = {};

// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = '8qw6cevpayp0vyd';

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var storyBankTable;
var accountTable;
var allPossible;
var storyBank;
var generalTable;
var storyModeTable;
var existingAccountIndex;
var accountIndex;
//existing combinations 
var existingAccounts;
var existingPersonList;
var existingSceneList;


//new values for each launch
var storyIndex = 0;
var gameScore = 0;
var progress = 0;
var updateListBool = true;

var startingInterval = 1000 * 60 * 60 * 24;
var intervalSize = startingInterval * 2; 
var tempStartingInterval = 1000 * 60;
var tempIntervalSize = tempIntervalSize * 2;
var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;
var msecPerDay = msecPerHour * 24;

var NO_NEED_TO_REHEARSE = 0;
var NEED_REHEARSAL_SOON = 1;
var NEED_URGENT_REHEARSAL = 2; 

var urgentRehearsalList = [];
var rehearsalSoonList = [];

var bcrypt;
var NUM_OF_SIZE_OF_COMBINATIONS = 6;
var NUM_OF_ROUNDS = 5;

var CHAR_LIMIT = 30;
var UNIQUE_CHAR_LIMIT = 20;


var REGULAR_MODE = 0;
var HIGH_SECURITY = 1;

var NO_OVERLAP = 0;
var ONE_OVERLAP = 1;
var TWO_OVERLAP = 2;
var THREE_OVERLAP = 3;
var OVERLAP = 2;

//CONSTANT VALUES: ALL PAO LISTS
var personList = ['Adolf_Hitler',"Angelina_Jolie", 'Alfred_Hitchcock', 'Audrey_Hepburn', 'Barack_Obama',"Bart_Simpson", 
				  "Beethoven", "Ben_Affleck", "Benjamin_Franklin", "Beyonce", //10
				  "Bill_Clinton",'Bill_Gates', "Brad_Pitt", "Bruce_Lee",
				  "Charlie_Chaplin", "Christopher_Columbus", "Darth_Vader","David_Beckham", 'Einstein', "Elvis_Presley",//10
				  'Frankenstein',"Frodo", "Gandalf", "Gandhi",
				  "George_W_Bush", 'George_Washington', "Harry_Potter",
				  "Hillary_Clinton", "Homer_Simpson", "Indiana_Jones", 
				  "Jennifer_Lopez", "Jimmy_Fallon", //12
				  "John_Lennon", "Johnny_Depp",
				  "Justin_Timberlake", "Kim_Jong_Un", "Kobe_Bryant",
				   "Lebron_James", "Leonardo_da_Vinci", "Leonardo_DiCaprio",
				   "Madonna", "Marilyn_Monroe", //10
				   "Mark_Twain",
				   "Mark_Zuckerberg", "Martin_Luther_King_Jr",
				   "Michael_Jackson","Michael_Jordan", "Michael_Phelps", 'Michelle_Obama', 
				   'Mickey_Mouse', "Mona_Lisa", 'Morgan_Freeman','Mozart', //11
				   "Neil_Armstrong", "Nelson_Mandela", 
				   "Oprah_Winfrey",
				   "Pope_Francis", "Princess_Diana", 'Ronald_Reagan', "Sherlock_Holmes",
				   "Sir_Issac_Newton", "Stephen_Hawking", "Steve_Jobs", //10
				   "Superman",
				   "Thomas_Edison", "Tiger_Woods", "Vincent_Van_Gogh", "Vladimir_Putin", "William_Shakespeare"]; //69


var actionList = ['balancing', 'bending', 'biting', 'bouncing', 'building', 'burning' , 'chasing', 'clapping', 'climbing' ,'cooking', 'digging',
				  'drinking', 'enlarging', 'exploding', 'feeding', 'fighting', 'flipping', 'hanging', 'hiding', 'hugging', 'juggling', 'kissing',
				  'licking', 'painting', 'piloting', 'pushing', 'repairing', 'rubbing', 'scratching', 'shooting', 'smelling', 'swinging','throwing',
				  'tickling', 'tying', 'washing', 'wrapping', 'zooming'];

var objectList = ['dome','hammer','heel','hen','igloo','leaf', 'lock', 'moose', 'seal', 'smore', 'snowflake','suit','daisy','dice','safe','toilet',
				  'moon', 'map','lollipop','peach', 'bus'];

var sceneList = ['airport', 'baseball_field', 'basketball_court', 'bakery', 
				 'Big_Ben','bridge', 'Capitol_Building', 'castle', 'cliff', 'clouds',
				 'court', 'Eiffel_Tower', 'factory',
				 'fancy_house', 'farm', 'fitness_center', 'forest', 'garden', 'garage',
				 'Great_Sphynx', 'glacier', 'Grand_Canyon', 'Great_Wall', 'hanging_bridge', 
				 'hotel_room','island', 'lake',
				 'library', 'lighthouse', 'mountain', 'Niagara_Falls', 'ocean', 'office','pool_bar', 'pyramids', 'restaurant', 'Statue_of_Liberty', 
				 'swimming_pool', 'Taj_Mahal',
				 'Tower_of_Pisa', 'tropical_beach', 'wharf','windmills', 'zoo']; //42



//function that generate 43 stories for use
function populate43Bank() {
	var usedPersonList = [];
	var usedSceneList = [];
	var finalPersonList = [];
	var finalSceneList = [];

	var NUMBER_OF_STORIES = 43;
	var temp = $('#randomnessTextBoxStoryMode').val();
	//should use sha256 but needs to be modified.  currently uses random 
	//var storyBankList = Sha256.generate(temp, 43);

	//personList[Math.floor(Math.random() * personList.length)];


}

//functions

//load variables & tables for the program
function loadProgramValues(datastore){
	storyBankTable = datastore.getTable('stories');
	accountTable = datastore.getTable('accounts');
	generalTable = datastore.getTable('general');


	//extract storyBank from DropBox records
	storyBank = stripStoryFromRecords();
	//compute all possible combinations of four stories
	allPossible = computeCombinations(storyBank, 4);
	//from generalTable load variables
	programRecord = generalTable.query();
	if (programRecord.length == 0) {
		//initialize values
		insertProgramRecord(generalTable);


	} else if (programRecord.length == 1) {
		programRecord = programRecord[0];
		//load stored values
		accountIndex = programRecord.get('accountIndex');
		existingAccountIndex = programRecord.get('existingAccountIndex');
		existingAccounts = programRecord.get('existingAccounts');//.toArray();
		existingPersonList = programRecord.get('existingPersonList');//.toArray();
		existingSceneList = programRecord.get('existingSceneList');//.toArray();

	} else {
		//error should never get here
	}

}


//testing purposes : delete all dropbox records
function deleteAllStories() {
	var records = storyBankTable.query();
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		storyBankTable.get(record.getId()).deleteRecord();
	}

	var records = accountTable.query();
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		accountTable.get(record.getId()).deleteRecord();
	}

	var records = generalTable.query();
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		generalTable.get(record.getId()).deleteRecord();
	}

	var records = storyModeTable.query();
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		storyModeTable.get(record.getId()).deleteRecord();
	}
}

//signoff DropBox Account & disable UI buttons & change back to home?
// where else to add sign-off button?
function signOff() {
	console.log('signing-off...');
	client.signOff();
	$('#home-game').addClass("ui-disabled");
	$('#home-bank').addClass("ui-disabled");
	$('#home-accounts').addClass("ui-disabled");
	location.reload();
}


//check if the account is a valid user account & 
//other constraints like length? invalid symbols? what else 
function isEmail(a){
	return a != '' ;///^([\w!.%+\-])+(?:\.[\w\-]+)+$/.test(a);
}


//utility function : string formatting for Javascript
String.format = function() {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {       
		var reg = new RegExp("\\{" + i + "\\}", "gm");             
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}

//given a nested array, flatten each inner arrat into a string seperated by |||
function convertNestedArraysToString(nestedArray) {
	var result = [];
	for (var i=0; i < nestedArray.length; i++) {
		var li = nestedArray[i];
		var dic = li[0] + '|||' + li[1];
		result.push(dic);
	}
	return result;
}

//given a string make it into a nested array
function parseStringToNestedArrays(arrayOfString) {
	var result = [];
	for (var i=0; i < arrayOfString.length(); i++) {
		var li = arrayOfString.get(i).split('|||'); 
		result.push(li);
	}
	return result;
}
//given four stories merge into one
function convertNestedStoriesToString(array) {
	var result = "";
	for (var i=0; i<array.length; i++) {
		var li = array[i];
		result += (li + '&&&&&&');
	}
	return result;
}

//search the given element in a dropbox list
function searchDropBoxList(list, element) {
	for (var i=0; i<list.length(); i++) {
		if (list.get(i) == element) return i;
	}
	return -1;
}
//end of unitilies 



//PHONE GAP : SHOWING CORRECT
function showAlertRight() {
    navigator.notification.alert(
        'Success!',  // message
        alertDismissed,         // callback
        '',            // title
        'Okay'                  // buttonName
  	);
}
//PHONE GAP : SHOWING CORRECT
function showAlertWrong() {
    navigator.notification.alert(
        'Please use the action and the object!',  // message
        alertDismissed,         // callback
        '',            // title
        'Sure'                  // buttonName
  	);
}


function updateTimeDic(web) {
	alert("update Rehearse Time");
	console.log(timeDic);
	var newtime = new Date();
	timeDic[web] = newtime.getTime();
	$.mobile.changePage("#accounts");
}


function checkPassword2(web) {
	event.preventDefault();

	//create a pop-up page to type in the password and do checking
	//var passwordPopup = $("<div data-role='dialog' data-title='generate a password for"+web + "' id="+web+"Password data-transition='pop' >"+"</div>");
	//passwordPopup.appendTo( $.mobile.pageContainer );
	var webPage = $('#'+web +"Page");
	var password = $('#'+web +"Password").find("#typein-password" + web).val();
	var newpassword = password.toLowerCase();

	//insert image there / get rid of the button
	var action = webPage.find(".actionButton").text();
	var object = webPage.find(".objectButton").text();
	if ((newpassword.indexOf(action)!= -1) && (newpassword.indexOf(object) != -1)){
   		showAlertRight();
 		webPage.find(".private").empty();
 		var base1 = "<p><a data-role='button' href=#accounts >Cancel</a></p>";
		webPage.find(".rehearseButton1").html(base1);
		var base2 = "<p><a data-role='button' href=# onclick=updateTimeDic('" + web + "') >Got it</a></p>";
		webPage.find(".rehearseButton2").html(base2);

 	} else {
 		showAlertWrong();
 		//alert('Please use the action and the object');
 		//$('#'+web +"Password").find("#typein-password" + web).val('');
 	}
 	$.mobile.changePage("#accounts");
	return
}
function renderBoardFromList(list, flag) {
	if (flag == NEED_URGENT_REHEARSAL) {
		title = "Urgent Rehearsals"; 
	} else if (flag == NEED_REHEARSAL_SOON) {
		title = "Rehearsals";
	} else {
		//should never get here
		alert('something is wrong!');
		return;
	}
	var html = "<h3>" + title + "</h3><hr><div class='rehearsalBoard'><ul data-role='listview' data-inset='true' class='rehearsalList'>";
	for (var i=0; i<list.length; i++)  {
		var story = list[i];
		var score = Math.round(calculateScoreForStory(story));
		var date = extractDate(story.get('lastRehearsed'));
		var pair = "<li class='boarditems'><span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption><p class='storyText'>{1}</p><p class='dateText'>{4}</p></figcaption></figure> \
					<figure><img class=pair src=images/scene/{2}.jpg /><figcaption><p class='storyText'>{3}</p><p class='scoreText'>Score:{5}</p></figcaption></figure></span></li>";
		var newli = String.format(pair, story.get('person'), story.get('person').replace('_', ' '), story.get('scene').toLowerCase(),
					story.get('scene').replace('_', ' '), date, score.toString());
	    html += newli;
	}
	html += '</ul></div>';
	return html;
}
function recoverStory(person, scene) {
	//first ask for five stories input 
	//assume have five of these for now in a list named knownStories
	

	//order problem? salt problem?

	//try all possible stories
	for (var i=0; i<actionList.length; i++) {
		for (var j=0; j<objectList.length; j++) {
			var longString = person + actionList[i] + objectList[j] + scene;
			//generate hash what about salt?

		}
	}
}

function rehearseStory(person, scene) {
	//udpate rehearsal time
	var stories = storyBankTable.query();
	for (var i=0; i<stories.length; i++) {
		//check each story and update it
		var story = stories[i];
		if (record.get('person') == person && record.get('scene') == scene) {
			//update story rehearse time
			var date = new Date();
			calculateElapsedTime(record.get('lastRehearsed'), date);
			record.set('lastRehearsed', date);
			record.set('totalRehearsal', record.get('totalRehearsal')+1);

			//everything is 100% now?? cannot tell 
			record.set('correctRehearsal', record.get('correctRehearsal')+1);
			// if that interval not satisfied aka length of satisfactory less than that intervalNum
			if (record.get('rehearsalList').length() <= record.get('intervalNum')) {
				record.get('rehearsalList').push(true);
				record.set('intervalNum', record.get('intervalNum')+1);
			}
		}
	}
	//clear page
	$.mobile.changePage('#board');
}

function changeRehearsalPage(person, scene) {
	person = person.replace(' ', '_');
	scene = scene.replace(' ', '_');
	var pageID = '#rehearsalPage';
	//intialize page
	if (!($(pageID).length)) {
		var newPage = $("<div data-role='page' data-title='rehearsalPage' id='rehearsalPage'><div data-role='header' data-position=fixed>\
						<a href=#board data-icon='back'>Back</a><h1>Rehearsal</h1></div><div data-role='content' class=images><span id='personSceneDiv'>\
						</span><span data-role='fieldcontain'><form action='#'><span class='boxWidget'><input autocorrect='off' name='password'\
						 id='rehearsal-password' value='' placeholder='doing what' autofocus='autofocus' tabindex='1'/>\
						<input autocorrect='off' name='password2' id='rehearsal-password-b' value='' tabindex='2' placeholder='doing what'/></span>\
						<br><br><div class=halfbuttonDiv><a data-role='button' id='gameCheckNextButton' tabindex='3' class=right onclick='rehearseStory()' >Rehearse</a>\
						<a href='#' class=left data-role='button' tabindex='4' onclick='recoverStory()'>I Forget</a></div></span></form></span>\
						</div></div>");
		newPage.appendTo( $.mobile.pageContainer );
		getVerbComboBox('rehearsal-password');
		getObjectComboBox('rehearsal-password-b');
		$( pageID ).page().page( "destroy" ).page();
	}
	//put person and scene in the picture
	var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
				<figure><img class=clue src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure>";
	var newHTML = String.format(html, person, person.replace('_', ' '), scene.toLowerCase(), scene.replace('_', ' '));
	$('#personSceneDiv').html(newHTML);
	//update box css 
	$('.boxWidget div').removeClass();
	$.mobile.changePage(pageID);
	$('#rehearsal-password').focus();
}

function createPageForStory(person, scene) {
	person = person.replace(' ', '_');
	scene = scene.replace(' ', '_');
	var pageName = person + scene;
	var pageID = '#' + pageName + 'Page';
	if (!($(pageID).length)){
		var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					<figure><img class=clue src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure>\
					<span data-role='fieldcontain'><form action='#'>\
					<span><input autocorrect='off' name='password' id='rehearsal-password'"+personName+" value='' placeholder='doing what' autofocus='autofocus' tabindex='1'/>\
					<input autocorrect='off' name='password2' id='rehearsal-password-b"+personName+"' value='' tabindex='2' placeholder='doing what'/></span>\
					<br><br><div class=halfbuttonDiv><a data-role='button' tabindex='3' class=right onclick='rehearseStory()' >Rehearse</a>\
					<a href='#' class=left data-role='button' tabindex='4' onclick='recoverStory()'>I Forget</a></div></span></form>";
		var newHTML = String.format(html, person, person.replace('_', ' '), scene.toLowerCase(), scene.replace('_', ' '));
		var newPage = $("<div data-role='page' data-title='"+personName+"' id="+personName+"Page><div data-role='header' data-position=fixed>\
						 <a href=#board data-icon='back'>Back</a><h1>Rehearsal</h1></div><div data-role='content' class=images>"+newHTML+" </div></div>");
		newPage.appendTo( $.mobile.pageContainer );
		getVerbComboBox('rehearsal-password'+personName);
		getObjectComboBox('rehearsal-password-b'+personName);
		$( pageID ).page().page( "destroy" ).page();
	}
	$.mobile.changePage(pageID);
	$('#rehearsal-password').focus();
}

function renderRehearsalBoard() {
	var html = "Welcome back!";
	var buttonText = "";
	var boardText = "";
	var urgentLen = urgentRehearsalList.length;
	var soonLen = rehearsalSoonList.length;

	//no rehearsal due generate safe message
	if ((urgentLen == 0) && (soonLen == 0)) {
		html += "<p>All stories are rehearsed on time. Great job! </p>\
				 <p>Try do more rehearsals to increase your score.</p>";
		boardText = "<p>Great job! There are no rehearsals due.</p>\
					 <p>Do extra rehearsals in story bank to increase your score!</p>\
					 <p><a href='#bank' data-role='button'>Go!</a></p>";
		$("#home-rehearsal").attr("href", "#bank");
	} else if (urgentLen== 0) {
		html += "<p>There are " + soonLen.toString() + " stories that need to be rehearsed soon. Do them now!</p>";
		boardText = renderBoardFromList(rehearsalSoonList, NEED_REHEARSAL_SOON);
	} else if (soonLen == 0) {
		html += "<p>Oh no! There are " + urgentLen.toString() + " stories that need to be rehearsed NOW!</p>";
		boardText = renderBoardFromList(urgentRehearsalList, NEED_URGENT_REHEARSAL);
	} else {
		html += "<p>We are really behind schedule! There are " + urgentLen.toString() + " urgent reherasals, and " 
			   + soonLen.toString() + " stories to be rehearsed soon.</p>";
		boardText = renderBoardFromList(urgentRehearsalList, NEED_URGENT_REHEARSAL);
		boardText += renderBoardFromList(rehearsalSoonList, NEED_REHEARSAL_SOON);
	}
	//update home page
	$("#home-words").html(html); 
	$("#board-msg").html(boardText);
	//$('#rehearsalBoard li').removeClass();
	//$('#rehearsalList').removeClass();
	//update board page
}
function checkEachStory() {
	var records = storyBankTable.query();
	for (var i=0; i < records.length; i++ ) {
		var story = records[i];
		var originalDate = story.get('created');
		var currentDate = new Date();
		// if the story needs to be rehearsed then display it in home page
		var check = needRehearsal(originalDate, currentDate, story);
		if (check == NEED_URGENT_REHEARSAL) {
			//var old = $('#urgentRehearsal').html()
			//$('#urgentRehearsal').html( old + renderStoriesToBeRehearsed(story));
			urgentRehearsalList.push(story);
			console.log('urgent!' + story.get('person') + ' ' + story.get('scene'));
		} else if (check == NEED_REHEARSAL_SOON) {
			//var old = $('#regularRehearsal').html(old + renderStoriesToBeRehearsed(story));
			rehearsalSoonList.push(story);
			console.log('rehearse soon!' + story.get('person') + ' ' + story.get('scene'));
		} else {
			//no need to rehearse
			console.log('safe!' + story.get('person') + ' ' + story.get('scene'));
		}
	}
}


function renderStoriesToBeRehearsed(record) {
	var html = "<span class='pairdiv2'><figure><img class=pair2 src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure> \
				<figure><img class=pair2 src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure></span>";
	return String.format(html, record.get('person'), record.get('person'), record.get('scene').toLowerCase(), record.get('scene'));
}

function rehearsalSatisfied() {
}

function needRehearsal(originalDate, currentDate, record) {
	//first step calculate the elapsedTime from starting position in millsecs
	var elapsedMills = currentDate.getTime() - originalDate.getTime();
	//second get the intervalNum and calcualte total
	var nextTimeInterval = calculateTotalInterval(record.get('intervalNum')+1);
	var prevTimeInterval = calculateTotalInterval(record.get('intervalNum'));

	var elapsedSinceLastTime = elapsedMills - prevTimeInterval;
	var rehearsalInterval = nextTimeInterval - prevTimeInterval;

	if (elapsedSinceLastTime < rehearsalInterval * 0.75) {
		return NO_NEED_TO_REHEARSE;
	} else if (rehearsalInterval * 0.75 < elapsedSinceLastTime && elapsedSinceLastTime < rehearsalInterval * 0.99) {
		return NEED_REHEARSAL_SOON;
	} else {
		console.log('past interval time');
		return NEED_URGENT_REHEARSAL;
	}
}

function eachInterval(index) {
	if (index == 0) {
		return 1 * msecPerMinute;
	} else if (index == 1) {
		return 5 * msecPerMinute;
	} else {
		return Math.pow(2, (index-2)) * 12 * msecPerMinute;
	}
}

// function eachInterval(index) {
// 	if (index == 0) {
// 		return 4 * msecPerHour;
// 	} else if (index == 1) {
// 		return 20 * msecPerHour;
// 	} else {
// 		return Math.pow(2, (index-1)) * msecPerDay;
// 	}
// }

//given the number of rehearsal, calculate the totalElapsedTime

function calculateTotalInterval(num) {
	var totalTime = 0;
	for (var i=0; i < num; i++) {
		totalTime += eachInterval(i);
	}
	return totalTime; 
}


//given the last rehearsal time and the time now calculate 
function calculateElapsedTime(oldDate, newDate) {
	var elapsedMills = newDate.getMilliseconds() - oldDate.getMilliseconds();
}


//generate 10 stories to use later
function generateList() {
	var gamelist = [];
	var gameobjectlist = [];
	var gameactionlist = [];
	for (var i = 0; i < 10; i++) {
		var person = personList[Math.floor(Math.random() * personList.length)];

		while (searchDropBoxList(existingPersonList, person) != -1) {
			var person = personList[Math.floor(Math.random() * personList.length)];
		}
		existingPersonList.push(person);
		gamepersonlist.push(person);

		var action = actionList[Math.floor(Math.random() * actionList.length)];
		while (gameactionlist.indexOf(action) != -1) {
			var action = actionList[Math.floor(Math.random() * actionList.length)];
		}
		gameactionlist.push(action);

		var object = objectList[Math.floor(Math.random() * objectList.length)];
		while (gameobjectlist.indexOf(object) != -1) {
			var object = objectList[Math.floor(Math.random() * objectList.length)];		
		}
		gameobjectlist.push(object);

		var scene = sceneList[Math.floor(Math.random() * sceneList.length)];
		while (searchDropBoxList(existingSceneList, scene) != -1) {
			scene = sceneList[Math.floor(Math.random() * sceneList.length)];
		}
		existingSceneList.push(scene);
		gamelist.push([person, action, object, scene]);

	};

	return gamelist;
}
function startChecking() {
	alert('change here');
	var curPerson = gamepersonlist[storyIndex];
	var curScene = gamelist[storyIndex][3];
	var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
				<figure><img class=clue src=images/scene/{1}.jpg /><figcaption>{2}</figcaption></figure>\
				<span data-role='fieldcontain'><form action='#'>\
				<span class='boxWidget'><input name='password' autocorrect='off' id='game-password' value='' placeholder='doing what' autofocus='autofocus' tabindex='1'/>\
				<input autocorrect='off' name='password2' id='game-password-b' value='' tabindex='2' placeholder='doing what'/></span>\
				<br><br><div class=halfbuttonDiv><a data-role='button' type='submit' tabindex='3' class=right name='submit; value='submit' onclick='generateNextCheck()' >Check and Next</a>\
				<a href='#' data-role='button' class=left tabindex='4' onclick='forgetStory()'>I Forget</a></div></span></form></span>";
	$('#gamestories').html(String.format(html, curPerson, curPerson.split('_').join(' '), curScene.toLowerCase(), curScene.replace('_', ' ')));
	getVerbComboBox('game-password');
	getObjectComboBox('game-password-b');
	$( "#gamepage" ).page( "destroy" ).page();
	$('.boxWidget div').removeClass()
	$('#game-password').focus();
}

function callbackFn(hash) {
	console.log('Done!!!!!!!ID:' + progressCounter.toString());
	resultHashes.push(hash);
	progressCounter += 1;
}

var resultHashes = [];
var progressCounter = 0;

function progressFn() {

}

//calling bcrypt implementation to store all bcrypt hashes
function generateBCryptHashes(gamelist) {
	var k = NUM_OF_SIZE_OF_COMBINATIONS;
	var stringList = [];
	var round = NUM_OF_ROUNDS; 
	//process gamelist
	for (var i=0; i<gamelist.length; i++) {
		var story = gamelist[i];
		var string = story[0]+story[1]+story[2]+story[3];
		stringList.push(string.replace('_', '').toLowerCase());
	}
	var allCombinations = regularComputerCombinations(stringList, k);
	for (var i=0; i<allCombinations.length; i++) {
		var oneSet = allCombinations[i];
		var longString = '';
		for (var j=0; j<k; j++) {
			longString+=oneSet[j];
		}
		var salt;
		//generate salt using issac
		try {
			salt = bcrypt.gensalt(round);
		} catch (err) {
			alert(err);
			return;
		}
		try {
			bcrypt.hashpw(longString, salt, callbackFn, progressFn);

		} catch(err) {
			alert(err);
			return;
		}
	}
}



//add all stories from the bank to dropBox and storyBank
function addStories() {
	for (var i=0; i < 10; i++) {
		storyBank.push([gamelist[i][0], gamelist[i][3]]);
		existingPersonList.push(gamelist[i][0]);
		existingSceneList.push(gamelist[i][3]);
		insertStory(gamelist[i][0], gamelist[i][3]);
	}
	//clear storage
	allPossible = computeCombinations(storyBank, 4);
	//after adding all stories to bank need to generate bcrypt hashes of all combinations of 6
	generateBCryptHashes(gamelist);
	console.log(resultHashes)
	gamelist = [];
	$.mobile.changePage('#accounts');


}

//add selected stories to the story bank
function addSelect() {
	$('.image-checkbox-container img').each(function() {
		if (this.style.border != '') {
			console.log($(this).prev());
			var index = parseInt($(this).prev().firstChild.value);
			console.log(index);
			console.log(gamelist[index]);
			storyBank.push(gamelist[index])
		}
	});
	console.log(storyBank.length);
	allPossible = computeCombinations(storyBank, 4);
	$.mobile.changePage('#accounts');

}
function addSomeStories(){
	var html = '';
	var person;
	for (var i = 0; i < 10; i ++) {
		person = gamelist[i][0];
		html = html + "<div class='image-checkbox-container'><input type='checkbox' name='"+person+"Box' value=" + i.toString() + " /><img src='images/person/"+  person + ".jpg' /></div>";
	}
	html += "<input type='submit' value='Submit' onclick='addSelect()'>";
	$('#addStoryForm').html(html);
	$.mobile.changePage('#addStories');
	$( "#addStories" ).page( "destroy" ).page();

}

function onConfirmStory(button) {
	//forgetStory();
	if (button == 1) {
		forgetStory();
	} else {
		//set focus on text
		$('#game-password').focus();

	}
}

function backtoGame() {
	$.mobile.changePage('#gamepage');
	//
	setTimeout(doNothing, 1000);
	$('#game-password').focus();
}
function doNothing(){
	$('#game-password').focus();
}
function showRight() {
	 navigator.notification.alert(
        'Correct Story!',  // message
        doNothing,         // callback
        'Great Job!',            // title
        'Okay3'                  // buttonName
  	);
 }
function showWrong() {
    navigator.notification.confirm(
        'Wrong Story!',  // message
        onConfirmStory,         // callback
        'Wrong Story!',            // title
        'See Answer, Try Again'                  // buttonName
  	);
}

function generateNextCheck() {
	event.preventDefault();

	var password = $('#gamestories').find('#game-password').val();
	var password_b = $('#gamestories').find('#game-password-b').val();
	var newpassword = password.toLowerCase();
	var newpassword_b = password_b.toLowerCase();
	//$('#game-password').blur().focus();

	if (checkIndex == 0) {
		var action = gamelist[sequenceIndex][1];
		var object = gamelist[sequenceIndex][2];
	}
	else {
		var action = gamelist[checkIndex-1][1];
		var object = gamelist[checkIndex-1][2];
	}
	if ((newpassword.indexOf(action)!= -1) && (newpassword_b.indexOf(object) != -1)){
		//alert('correct!');
		progress += 1;
		//showRight();

		$("#checkMark").css('display', 'inline');
		$('#gamestories').css('visibility', 'hidden')
		setTimeout(function() { $("#checkMark").css('display', 'none'); 
								$("#gamestories").css('visibility', 'visible')}, 1000 );
		var p = progress/64.0;
		$('#progress-bar').val(p.toString());
		p = Math.round(p*100);
		$('#progress-val').html( ' ' + p.toString() + '%');
		gameScore += 1;
		if (checkIndex == 10) {
		$('#gamestories').html('<p>Final Score: ' + gameScore.toString() + "/10 </p><p><a data-role='button' href='#' onclick='addSomeStories()'> Add Some</a></p><p><a data-role='button' href='#' onclick='addStories()'> Add All</a></p><p><a data-role='button' href='#' onclick='startGame()'> Try Again</a></p>");

		} else {
			$('#gamestories').find('#game-password').val('');
			//$('#game-password').focus();
			var curPerson = gamepersonlist[checkIndex];
			var curScene = gamelist[checkIndex][3];
			var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
						<figure><img class=clue src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure>\
						<span data-role='fieldcontain'><form action='#'>\
						<span class='boxWidget'><input autocorrect='off' name='password' id='game-password' value='' placeholder='doing what' autofocus='autofocus' tabindex='1'/>\
						<input autocorrect='off' name='password2' id='game-password-b' value='' tabindex='2' placeholder='doing what'/></span>\
						<br><br><div class=halfbuttonDiv><a data-role='button' id='gameCheckNextButton' tabindex='3' class=right type='submit' name='submit; value='submit' onclick='generateNextSequence()' >Check and Next</a>\
						<a href='#' class=left data-role='button' tabindex='4' onclick='forgetStory()'>I Forget</a></div></span></form></span>";
			$('#gamestories').html(String.format(html, curPerson, curPerson.split('_').join(' '), curScene.toLowerCase(), curScene.replace('_', ' ') ));
			checkIndex += 1;
			getVerbComboBox('game-password');
			getObjectComboBox('game-password-b')
			$( "#gamepage" ).page( "destroy" ).page();
			$("#gameCheckNextButton").keypress(function(e) {
				if (e.keyCode == 13) {
					generateNextSequence();
				}
			});
			$('.boxWidget div').removeClass()
			$('#game-password').focus();
			//$.mobile.changePage("#gamepage");
		}	
	} else {

		//alert('wrong!');
		//showWrong();
		//generateNextCheck();
		//show wrong mark
		document.getElementById("checkMark").src = 'images/wrong.png';
		$("#checkMark").css('display', 'inline');
		$('#gamestories').css('visibility', 'hidden')
		setTimeout(function() { $("#checkMark").css('display', 'none'); 
								$("#gamestories").css('visibility', 'visible');
								document.getElementById("checkMark").src = 'images/check.png'}, 1000 );

	}
	
	
	

}

function forgetStory() {
	var html="<div class=clueDiv><figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
			 is <figure><img class=clue src=images/action/{2}1.jpg /><figcaption>{3}</figcaption></figure>\
			 {8}<figure><img class=clue src=images/object/{4}1.jpg /><figcaption>{5}</figcaption></figure>\
			 in/on<figure><img class=clue src=images/scene/{6}.jpg /><figcaption>the {7}</figcaption></figure></div>";
	if (checkIndex == 0) {
		var cS = gamelist[sequenceIndex];
	} else {
		var cS = gamelist[checkIndex-1];
	}
	if (cS[2] == 'igloo') {
		var article = 'an';
	} else {
		var article = 'a'
	}
	$('#hintSpace').html(String.format(html, cS[0], cS[0].split('_').join(' '), cS[1], cS[1], cS[2], cS[2], cS[3].toLowerCase(), cS[3], article));
	$.mobile.changePage("#gameForget");
}

function generateNextSequence() {
	event.preventDefault();
	//generate next story

	if (storyIndex <= sequenceIndex) {
		if (storyIndex == 0) {
			var html="<div class=clueDiv><figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					 is <figure><img class=clue src=images/action/{2}1.jpg /><figcaption>{3}</figcaption></figure>\
					 {8}<figure><img class=clue src=images/object/{4}1.jpg /><figcaption>{5}</figcaption></figure> \
					 in/on<figure><img class=clue src=images/scene/{6}.jpg /><figcaption>the {7}</figcaption></figure></div>\
					 <div><a href='#' tabindex='1' data-role='button' onclick='generateNextSequence();' >Next</a></div>";
			var cS = gamelist[storyIndex];
			if (cS[2] == 'igloo') {
				var article = 'an';
			} else {
				var article = 'a'
			}
			$('#gamestories').html(String.format(html, cS[0], cS[0].split('_').join(' '), cS[1], cS[1], cS[2], cS[2], cS[3].toLowerCase(), cS[3], article));
			$.mobile.changePage("#gamepage");
			storyIndex += 1;
			$( "#gamepage" ).page( "destroy" ).page();

		} else {
		generateNextStory();
		$( "#gamepage" ).page( "destroy" ).page();
		}
	}
	//generate next check
	else if ((storyIndex > sequenceIndex) && (checkIndex <= sequenceIndex )) {
		if (checkIndex == -1) {
			var curPerson = gamepersonlist[sequenceIndex];
			var curScene = gamelist[sequenceIndex][3];
			var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
						<figure><img class=clue src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure>\
						<span data-role='fieldcontain'><form action='#'>\
						<span class='boxWidget'><input type='text' autocorrect='off' name='password' id='game-password' value='' placeholder='doing what' autofocus='autofocus' tabindex='1'/>\
						<input type='text' autocorrect='off' name='password2' id='game-password-b' value='' placeholder='doing what' tabindex='2'/></span>\
						<br><br><div class=halfbuttonDiv><a data-role='button' id='gameCheckNextButton' type='submit' class=right name='submit' value='submit' onclick='generateNextSequence()' tabindex='3'>Check and Next</a>\
						<a href='#' class=left data-role='button' tabindex='4' onclick='forgetStory()'>I Forget</a></div></span></form></span>";
			$('#gamestories').html(String.format(html, curPerson, curPerson.split('_').join(' '), curScene.toLowerCase(), curScene.replace('_', ' ')));
			checkIndex +=1;
			gameScore = -1;
			getVerbComboBox('game-password');
			getObjectComboBox('game-password-b');
			$( "#gamepage" ).page( "destroy" ).page();
			$("#gameCheckNextButton").keypress(function(e) {
				if (e.keyCode == 13) {
					generateNextSequence();
				}
			});
			$('.boxWidget div').removeClass()
			$('#game-password').focus();

		} else if ((checkIndex == 0) && (sequenceIndex == 0)){
			var curPerson = gamepersonlist[0];
			var curScene = gamelist[0][3];
			var html = "<figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
						<figure><img class=clue src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure>\
						<span data-role='fieldcontain'><form action='#'>\
						<span class='boxWidget'><input type='text' autocorrect='off' name='password' id='game-password' value='' placeholder='doing what' autofocus='autofocus'tabindex='1'/>\
						<input type='text' autocorrect='off' name='password2' id='game-password-b' value='' placeholder='doing what'tabindex='2'/></span>\
						<br><br><div class=halfbuttonDiv><a data-role='button' id='gameCheckNextButton' type='submit' class=right name='submit' value='submit' tabindex='3' onclick='generateNextSequence()' >Check and Next</a>\
						<a href='#' class=left data-role='button' tabindex='4' onclick='forgetStory()'>I Forget</a></div></span></form></span>";
			$('#gamestories').html(String.format(html, curPerson, curPerson.split('_').join(' '), curScene.toLowerCase(), curScene.replace('_', ' ')));
			checkIndex +=1;
			getVerbComboBox('game-password');
			getObjectComboBox('game-password-b');
			$( "#gamepage" ).page( "destroy" ).page();
			//make enter for submit
			$("#gameCheckNextButton").keypress(function(e) {
				if (e.keyCode == 13) {
					generateNextSequence();
				}
			});
			$('.boxWidget div').removeClass();
			$("#game-password").focus();

		}
		else {
		generateNextCheck();
		}

	}
	else {
		if (checkIndex == 10) {
			generateNextCheck();
		} else if (checkIndex > sequenceIndex) {
			sequenceIndex += 1;
			//storyIndex = 0;
			//for current scoing
			event.preventDefault();
			$('#game-password').focus();
			var password = $('#gamestories').find('#game-password').val();
			var password_b = $('#gamestories').find('#game-password-b').val();
			var newpassword = password.toLowerCase();
			var newpassword_b = password_b.toLowerCase();
			var action = gamelist[checkIndex-1][1];
			var object = gamelist[checkIndex-1][2];
			if ((newpassword.indexOf(action)!= -1) && (newpassword_b.indexOf(object) != -1)){
				//alert('correct!');
				progress += 1;
				//$("#checkMark").css('visibility', 'visible');
				$("#checkMark").css('display', 'inline');
				$('#gamestories').css('visibility', 'hidden')
				setTimeout(function() { $("#checkMark").css('display', 'none'); 
										$("#gamestories").css('visibility', 'visible')}, 1000 );
				//setTimeout(function() { $("#checkMark").css('visibility', 'hidden'); }, 1000 );
				var p = progress/64.0;
				//$( ".progressbar" ).progressbar({ value: 50 });
				$('#progress-bar').val(p.toString());
				p = Math.round(p*100);
				$('#progress-val').html( ' ' + p.toString() + '%');

				//showRight();
				checkIndex = -1;
				gameScore += 1;
				generateNextSequence();
			} else {
				//alert('wrong2!');
				//showWrong();
				sequenceIndex -= 1;
				document.getElementById("checkMark").src = 'images/wrong.png';
				//$('#checkMark').src = 'images/wrong.png';
				$("#checkMark").css('display', 'inline');
				$('#gamestories').css('visibility', 'hidden')
				setTimeout(function() { $("#checkMark").css('display', 'none'); 
										$("#gamestories").css('visibility', 'visible');
										document.getElementById("checkMark").src = 'images/check.png';
										}, 1000 );
				//document.getElementById("checkMark").src = 'images/check.png';

			}
			$( "#gamepage" ).page( "destroy" ).page();
		}
	}
	
}
function generateNextStory() {
	var cS = gamelist[storyIndex];
	var html="<div><figure><img class=clue src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
			 is<figure><img class=clue src=images/action/{2}1.jpg /><figcaption>{3}</figcaption></figure>\
			 {8}<figure><img class=clue src=images/object/{4}1.jpg /><figcaption>{5}</figcaption></figure>\
			 in/on<figure><img class=clue src=images/scene/{6}.jpg /><figcaption>the {7}</figcaption></figure>\
			 </div><div><a href='#' data-role='button' tabindex='1' onclick='generateNextSequence();' >Next</a></div>";
	if (cS[2] == 'igloo') {
		var article = 'an';
	} else {
		var article = 'a'
	}
	$('#gamestories').html(String.format(html, cS[0], cS[0].split('_').join(' '), cS[1], cS[1], cS[2], cS[2], cS[3].toLowerCase(), cS[3].replace('_' ,' '), article));
	storyIndex += 1;

	//$.mobile.changePage("#gamepage");

}

function randomnessGenerator(){
	//before starting the game direct to the text box page and ask the users to 
	$.mobile.changePage('#generateRandomness');
}
var gamelist;
var gamepersonlist;
var sequenceIndex;
var checkIndex;

//given a gamelist, get the personlist from 
function stripPersonFromList(glist) {
	var result = [];
	for (var i=0; i<glist.length; i++) {
		result.push(glist[i][0]);
	}
	return result;
}

//start the memory game
function startGame() {
	totalStories = 23;
	numStories = 10;
	storyIndex = 0;
	checkIndex = 0;
	sequenceIndex = 0;
	gameScore = 0;
	gamepersonlist = [];
	gamelist=[];
	//ready?
	//var myVar=window.setTimeout(function(){changeDisplay('<p>Ready?<p>')},1000);

	//Step1: first generate the 10-story list
	if (existingPersonList.length() > (totalStories-numStories)) {
		//do not have 10 new ppl to put in the list
		alert("Not Enough to Generate 10 new stories");

	} else{
		var temp = $('#randomnessTextBox').val();
		gamelist = Sha256.generate(temp, 10);
		gamepersonlist = stripPersonFromList(gamelist);

		//gamelist = generateList();
		console.log(gamelist);
		console.log('that is gamelist');
		//generateBCryptHashes(gamelist);
		generateNextSequence();
	}
}

function changePerson(person, web) {
	var newperson = personList[Math.floor(Math.random() * personList.length)];

	while (searchDropBoxList(existingPersonList, newperson) != -1) {
		newperson = personList[Math.floor(Math.random() * personList.length)];
	}
	existingPersonList.push(newperson);
	document.getElementById(web+'Person').src = "images/person/" + newperson + '.jpg';
	$('#' + web + 'Name').html(newperson);

}

function updateStoryRefCount(webName, accountNestedList){
	//for each story find the story record then add one to ref count
	console.log(accountNestedList);
	var records = storyBankTable.query();
	for (var i=0; i<records.length; i++) {
		var record = records[i];
		for (var j=0; j<accountNestedList.length; j++) {
			var person = accountNestedList[j][0];
			var scene = accountNestedList[j][1];
			if (record.get('scene') == scene && record.get('person') == person) {
				record.set('refCount', record.get('refCount')+1);
				var tempList = record.get('refList');
				tempList.push(webName);
			}
		}
	}
}
function getImages2(web, useMyOwn) {
	var possible = allPossible[Math.floor(Math.random() * allPossible.length)];
	var accountStoryList = convertNestedArraysToString(possible);
	var accountInfo = convertNestedStoriesToString(accountStoryList);

	while (searchDropBoxList(existingAccounts, accountInfo) != -1) {
		possible = allPossible[Math.floor(Math.random() * allPossible.length)];
		accountStoryList = convertNestedArraysToString(possible);
		accountInfo = convertNestedStoriesToString(accountStoryList);
	}

	insertAccount(web, accountStoryList, existingAccountIndex);
	updateStoryRefCount(web, possible);
	//add one to existingAccountIndex
	existingAccountIndex+=1;
	programRecord.set('existingAccountIndex', existingAccountIndex) ;	

	existingAccounts.push(accountInfo);

	var html = "<div id='" + web + "Stories'>";
	//var html = "<div id='" + web + "Stories'><ul = data-role='listview'>"
	for (var i=0; i < possible.length; i ++) {
		//var liold = '<li><a href="#"><img src="images/person/{0}.jpg" />{1}</a><li>'
		if (i % 2 == 0) {
			var liold = "<div class=twoPairs><span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure></span>";
		}
		else {
			var liold = "       &nbsp&nbsp<span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure></span></div>";
			}
		var li = String.format(liold, possible[i][0], possible[i][0], possible[i][1].toLowerCase(), possible[i][1]);
		html += li;
	}
	var temp = existingAccountIndex-1
	html += "</div><br><input type='text' autocorrect='off' name='password' id='"+web+"-password' value='' placeholder='Type in your password' autofocus='autofocus'/>\
			<a href=# data-role='button' data-rel='popup' onclick='checkPasswordNew(\""  + web + "\", " + temp + ")' > Type in your Password</a>"
	return html;
}
function showPopupRight(web) {
	alert('correct');
	//$('#successPage').dialog();
	$("#" + web + "checkMark").css('display', 'inline');
	$('#' + web + "Stories").css('visibility', 'hidden')
	setTimeout(function() { $("#" + web + "checkMark").css('display', 'none'); 
							$('#' + web + "Stories").css('visibility', 'visible');
							document.getElementById(web+"checkMark").src = 'images/check.png'}, 1000 );
}
function showPopupWrong(web) {
	alert('wrong');
	document.getElementById(web+"checkMark").src = 'images/wrong.png';
	$($('#' + web + "checkMark")).css('display', 'inline');
	$($('#' + web + "Stories")).css('visibility', 'hidden');
	setTimeout(function() { $('#' + web + "checkMark").css('display', 'none'); 
							$('#' + web + "Stories").css('visibility', 'visible');
							document.getElementById(web+"checkMark").src = 'images/check.png'}, 1000 );

}

function calculateScoreForStory(story) {
	//get previous # of rehearsals
	var c1 = 5;
	var c2 = 0.00001;
	var c3 = 10;
	var nextTimeInterval = calculateTotalInterval(story.get('intervalNum')+1);
	var originalDate = story.get('created');
	var currentDate = new Date();
	var part1 = c1 * (story.get('intervalNum') + 1);
	var part2 = c2 * (nextTimeInterval - (currentDate.getTime() - originalDate.getTime()));
	var part3 = c3 * (story.get('correctRehearsal') / story.get('totalRehearsal'));
	//console.log(part1.toString() + ' ' + part2.toString() + ' ' + part3.toString());
	return part1 + part2 + part3;

}

function checkPasswordNew(web, index) {
	//update rehearsal time

	//var answer = existingAccounts[index];
	var answer = $('#' + web + 'Page').find('#' + web+'-password').val(); 
	if (answer != '') {
		//update reherasal time of each story as well as the account
		var records = accountTable.query();
		for (var i=0; i<records.length; i++) {
			var record = records[i];
			if (record.get('account') == web) {
				//find the account record & set the time
				record.set('lastRehearsal', new Date());
				var storyList = record.get('storyList');
			}
		}
		storyList = parseStringToNestedArrays(storyList);
		var records = storyBankTable.query();
		for (var i=0; i<records.length; i++) {
			//check each story and update it
			var record = records[i];
			for (var j=0; j<storyList.length; j++) {
				var story = storyList[j];
				if (record.get('person') == story[0] && record.get('scene') == story[1]) {
					//update record time
					var date = new Date();
					console.log('calculating old ' + record.get('lastRehearsed').toString()  + ' new ' + date.toString());
					calculateElapsedTime(record.get('lastRehearsed'), date);
					record.set('lastRehearsed', date);
					record.set('totalRehearsal', record.get('totalRehearsal')+1);
					//everything is 100% now?? cannot tell 
					record.set('correctRehearsal', record.get('correctRehearsal')+1);
					console.log('story last reherased....');
					console.log(date);
					// if that interval not satisfied aka length of satisfactory less than that intervalNum
					if (record.get('rehearsalList').length() <= record.get('intervalNum')) {
						record.get('rehearsalList').push(true);
						record.set('intervalNum', record.get('intervalNum')+1);
					}

				}
			}
		}
		$.mobile.changePage($("#accounts"));
	}
	
	//for (var i=0; i < answer.length; i ++) {
	//	if ((guess.indexOf(answer[i][1]) == -1) || (guess.indexOf(answer[i][2]) == -1)) {
	//		//passwork wrong
	//		showPopupWrong(web);
	//		return;
	//	}
	//}
	//showPopupRight(web);
}

function submit(e){
	if (((e.keyCode === 13) || (e.keyCode == undefined)) && ($("#entry:focus"))) {
		e.preventDefault();
		//if pass validation of data
		var useMyOwn = false;
		//var useMyOwn = document.getElementById('checkbox-2').checked;
		var keyid = 'button' + accountIndex;
		var value = $('#account-name').val();
		$('#account-name').val('');
		if (isEmail(value)) {
			var estring = 'list'+accountIndex;
			var jbuttonid = '#' + keyid;
			var listid = '#' +estring;
			//$("#list").append("<li id="+value+ "><a href=#"+value+"Page id="+keyid+" data-wrapperels='span' data-inline='true' data-icon='delete' data-iconpos='right' data-theme='a'>" + value + "</a></li>");
			//$('#list').listview('refresh');
			//accountIndex += 1;
			//programRecord.set('accountIndex', accountIndex);
			
			//var images = getImages(value, useMyOwn);
			//var images = getImages2(value, useMyOwn);
			//var footer = "<div data-role=footer data-id=fool data-position=fixed><div data-role=navbar><ul><li><a href=#home>Home</a></li><li><a href=#accounts>Accounts</a></li><li><a href=#confirm>Setting</a></li>";
			//var newPage = $("<div data-role='page' data-title='"+value+"' id="+value+"Page><div data-role='header' data-position=fixed><a href=#accounts data-icon='back'>Back</a><h1>"+ value + "</h1></div><div data-role='content' class=images>"+images+" </div>"+footer+"</div>");
			//var popupPage = $("<div data-role='page' data-trasntion='pop' data-rel='pop' data-title='generate a password for"+value + "' id="+value+"Password ><div data-role='fieldcontain'><form action='#' id='passwordChecking'><div><input type='text' autocorrect='off' name='password' id='typein-password" + value + "' value='' placeholder='Type in your password' autofocus='autofocus'/></div><button type='submit' name='submit; value='submit' id='passwordSubmit" + value + "' onclick='checkPassword2(\""  + value + "\")' >Check</button></form></div></div>");
			
			$('.images').css('text-align','center');

			var possible = allPossible[Math.floor(Math.random() * allPossible.length)];
			var accountStoryList = convertNestedArraysToString(possible);
			var accountInfo = convertNestedStoriesToString(accountStoryList);

			while (searchDropBoxList(existingAccounts, accountInfo) != -1) {
				possible = allPossible[Math.floor(Math.random() * allPossible.length)];
				accountStoryList = convertNestedArraysToString(possible);
				accountInfo = convertNestedStoriesToString(accountStoryList);
			}

			insertAccount(value, accountStoryList, existingAccountIndex);
			updateStoryRefCount(value, possible);
			//add one to existingAccountIndex
			existingAccountIndex+=1;
			programRecord.set('existingAccountIndex', existingAccountIndex) ;	

			existingAccounts.push(accountInfo);	

			renderAccountList(true);
			//newPage.appendTo( $.mobile.pageContainer );
			//popupPage.appendTo( $.mobile.pageContainer);
			currentPageID = value;
			if (useMyOwn) {
				$.mobile.changePage($("#camera"));

				return false;
			}
			
			//$.mobile.changePage(newPage);

			console.log('page changed');
		}

	} else {
		alert('email not valid');
	}
	return false;
}

function stripStoryFromRecords() {
	var records = storyBankTable.query();
	var storyList = [];
	for (var i = 0; i < records.length; i++ ){
		var record = records[i];
		storyList.push([record.get('person'), record.get('scene')]);
	}
	return storyList;
}

function renderEachAccountElements(time, web, list, index) {
	//check duplicate?

	//create html for each page
	var html = "<div id='" + web + "Stories'>";
	//var html = "<div id='" + web + "Stories'><ul = data-role='listview'>"
	for (var i=0; i < list.length; i ++) {
		//var liold = '<li><a href="#"><img src="images/person/{0}.jpg" />{1}</a><li>'
		if (i % 2 == 0) {
			var liold = "<div class=twoPairs><span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure></span>";
		}
		else {
			var liold = "       &nbsp&nbsp<span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption>{1}</figcaption></figure>\
					 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption>{3}</figcaption></figure></span></div>";
			}
		var li = String.format(liold, list[i][0], list[i][0].replace('_', ' '), list[i][1].toLowerCase(), list[i][1].replace('_',' '));
		html += li;
	}
	html += "</div><br><input type='text' autocorrect='off' name='password' id='"+web+"-password' value='' placeholder='Type in your password' autofocus='autofocus'/>\
			<a href=# data-role='button' data-rel='popup' onclick='checkPasswordNew(\""  + web + "\", " + index + ")' > Rehearse Account</a>"
	return html;
}

function renderAccountList(changePage) {

	//$('#accounts').bind('pageshow', function() {


		var records = accountTable.query();
		var stories = storyBankTable.query();

		//if there are stories in the bank
		if (stories.length > 0) {
			//create each page for each account
			for (var i=0; i < records.length; i++) {
				var record = records[i];
				var temp = record.get('storyList');
				var list = parseStringToNestedArrays(record.get('storyList'));
				var web = record.get('account');
				var accountIndexForChecking = record.get('existingAccountIndex');
				var time = record.get('lastRehearsal').toString();
				var pageHtml = renderEachAccountElements(time, web, list, accountIndexForChecking);
				//var footer = "<div data-role=footer data-id=fool data-position=fixed><div data-role=navbar><ul><li>\
				//			  <a href=#home>Home</a></li><li><a href=#accounts>Accounts</a></li><li><a href=#confirm>Setting</a></li>";
				var newPage = $("<div data-role='page' data-title='"+web+"' id="+web+"Page><div data-role='header' data-position=fixed>\
								<a href=#accounts data-icon='back'>Back</a><h1>"+ web + "</h1></div><div data-role='content' class=images>"+pageHtml+" </div></div>");
				
				if (updateListBool || (changePage && i==records.length-1)) {
					//if insert the first time
					var keyid = 'button' + accountIndex;
					var estring = 'list'+accountIndex;
					var jbuttonid = '#' + keyid;
					var listid = '#' +estring;
					$("#list").append("<li id="+web+ "><a href=#"+web+"Page id="+keyid+" data-wrapperels='span' data-inline='true' data-icon='delete' data-iconpos='right' data-theme='a'>" + web + "</a></li>");
					if ($('#list').hasClass('ui-listview')) {
						$('#list').listview('refresh');
					} else {
						$('#list').trigger('create');
					}
					//$('#list').listview('refresh');
					if (updateListBool || (changePage && i==records.length-1)) {
						newPage.appendTo( $.mobile.pageContainer );
					}

				}
				

			}
			//update the account page
		} else {
			//alert('play the game!');
		}
		if (changePage) {
			accountIndex += 1;
			programRecord.set('accountIndex', accountIndex);
			$.mobile.changePage(newPage);
		}

	//})
	updateListBool = false;

}

function extractDate(time) {
	var year = time.getFullYear();
	var date = time.getDate();
	var hour = time.getHours();
	var month = time.getMonth();
	var months = ['Jan', 'Feb', 'Mar', 'Apr', "May", 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var hours = ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
				 '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
	return String.format("{0} {1}, {2} {3}\'", hours[hour], months[month], date, year)
}
function renderStoryBank() {
	$('#bank').bind("pageshow", function() {

		var records = storyBankTable.query();
		if (records.length > 0) {
			var listHTML = '<div id="bankStories"><ul data-role="listview" data-inset="true">'
			for (var i =0; i < records.length; i++ ){
				var record = records[i];
				var score = Math.round(calculateScoreForStory(record));
				//var li = '<li><a href="#" ><img src="images/person/{0}.jpg"><p>{1}</p></a></li>'
				/*var pair = "<li><span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption><span class='storyText'>{1}</span></figcaption></figure> \
						 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption><span class='storyText'>{3}</span></figcaption></figure></span><span class='storyText'>{4}</span><span class='storyText'>Score : {5}</span></li>";
				var newli = String.format(pair, record.get('person'), record.get('person').replace('_', ' '), record.get('scene').toLowerCase(),
					record.get('scene').replace('_', ' '), record.get('lastRehearsed').toString(), score.toString());
*/				var date = extractDate(record.get('lastRehearsed'));
				var pair = "<li><span class='pairdiv'><figure><img class=pair src=images/person/{0}.jpg /><figcaption><p class='storyText'>{1}</p><p class='dateText'>{4}</p></figcaption></figure> \
						 	<figure><img class=pair src=images/scene/{2}.jpg /><figcaption><p class='storyText'>{3}</p><p class='scoreText'>Score:{5}</p></figcaption></figure></span></li>";
				var newli = String.format(pair, record.get('person'), record.get('person').replace('_', ' '), record.get('scene').toLowerCase(),
					record.get('scene').replace('_', ' '), date, score.toString());
	    		listHTML += newli;
	    	}
	    	listHTML += "</ul></div>";
	   		$('#banklist').html(listHTML);
	   		$("#bankStories").listview().listview("refresh");
		}
	});

}
function calculateUniqueChar(txt) {
	var uniqueCharList = [];
	for (var i=0; i<txt.length; i++) {
		var aChar = txt.charAt(i);
		if (uniqueCharList.indexOf(aChar) == -1) {
			uniqueCharList.push(aChar);
		}
	}
	return uniqueCharList.length;
}
//key up function 
function limits(obj, suffix) {
	var limit = CHAR_LIMIT;
	var uniqueLimit = UNIQUE_CHAR_LIMIT;
	var counter = $('#charCounter'.concat(suffix));
	var uniqueCounter = $('#uniqueCharCounter'.concat(suffix));
	var txt = obj.val();
	var length = txt.length;
	var uniqueLength = calculateUniqueChar(txt);
	//if length not enough
	if (!(length >= limit && uniqueLength >= uniqueLimit)) {
		counter.html(length);
		uniqueCounter.html(uniqueLength);
	} else {
		//enalbe button
		//TO DO fix button 
		document.getElementById('submitRandom'.concat(suffix)).disabled = false;
		counter.html(length);
		uniqueCounter.html(uniqueLength);
	}
}
$( document ).ready(function(){
	$('#board').load();
	var emaiList = $('#accountsList');
	var sbutton = $('#submit');
	$('#accountsList').submit(submit);
	$('.image-checkbox-container img').on('click', function(){
	if (!$(this).prev().prop('checked')) {
		//if(!$(this).prev('input[type="checkbox"]').prop('checked')){
        $(this).prev().prop('checked', true);
        console.log($(this).prev());
        this.style.border = '4px solid #38A';
        this.style.margin = '0px';
    } else{
        $(this).prev().prop('checked', false);
        this.style.border = '0px';
        this.style.margin = '4px';
    }});
    $.getScript("sha2.js", function(){
    	console.log("SHA 256 loaded and executed.");
    });
    bcrypt = new bCrypt();
    //set up keyup for randomness text box

    $('#randomnessTextBox').keyup(function() {
    	limits($(this), '');
    });
    $('#randomnessTextBoxStoryMode').keyup(function() {
    	limits($(this), 'StoryMode');
    });

    //DROPBOX FUNCTIONS
	window.insertStory = function insertStory(personName, sceneName) {
		storyBankTable.insert({
			scene: sceneName,
			person: personName,
			created: new Date(),
			lastRehearsed: new Date(),
			refCount: 0,
			refList: [],
			intervalNum: 0,
			rehearsalList: [],
			correctRehearsal: 1,
			totalRehearsal: 1,
			interval: tempStartingInterval
		});
	}

	window.insertAccount = function insertAccount(accountName, storyList, index) {
		accountTable.insert({
			account: accountName,
			created: new Date(),
			lastRehearsal: new Date(),
			storyList: storyList,
			existingAccountIndex: index
		});
	}
	window.insertProgramRecord = function insertProgramRecord(generalTable) {
		generalTable.insert({
			accountIndex : 0,
			existingAccountIndex : 0,
			existingAccounts : [],
			existingSceneList : [],
			existingPersonList : []
		});
	}
	function updateAccountList() {
		var records = accountTable.query();

		//sort by last rehearseal date
		records.sort(function (accountA, accountB) {
			if (accountA.get('lastRehearsal') < accountB.get('lastRehearsal')) return -1;
			if (accountA.get('lastRehearsal') > accountB.get('lastRehearsal')) return 1;
			return 0;
		});
		//changePage? update?
		renderAccountList(false);
	}

	function updateStoryBankList() {
		$('#bankStories').empty();
		var records = storyBankTable.query();

		//sort by ref counts
		records.sort(function (storyA, storyB) {
			if (storyA.get('refCount') < storyB.get('refCount')) return -1;
			if (storyA.get('refCount') > storyB.get('refCount')) return 1;
			return 0;
		});
		renderStoryBank();
	}
	// updateList will be called every time the table changes.
	function updateList() {
		$('#tasks').empty();

		var records = taskTable.query();

		// Sort by creation time.
		records.sort(function (taskA, taskB) {
			if (taskA.get('created') < taskB.get('created')) return -1;
			if (taskA.get('created') > taskB.get('created')) return 1;
			return 0;
		});

		// Add an item to the list for each task.
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			$('#tasks').append(
				renderTask(record.getId(),
					record.get('completed'),
					record.get('taskname')));
		}

		//addListeners();
		//$('#newTask').focus();
	}
    $('#loginButton').click(function (e) {
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});

	// Try to finish OAuth authorization.
	client.authenticate({interactive:false}, function (error) {
		if (error) {
			alert('Authentication error: ' + error);
		}
	});
	if (client.isAuthenticated()) {
		// Client is authenticated. Display UI.
		$('#loginButton').hide();
		$('#main').show();
		$('#home-navbar li').removeClass('ui-disabled');
		$('#home-game').removeClass("ui-disabled");
		$('#home-bank').removeClass("ui-disabled");
		$('#home-accounts').removeClass("ui-disabled");
		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}
			storyModeTable = datastore.getTable('storyModeGeneral');
			storyBankTable = datastore.getTable('stories');
			accountTable = datastore.getTable('accounts');
			generalTable = datastore.getTable('general');

//////for compiling
			//extract storyBank from DropBox records
			//////storyBank = stripStoryFromRecords();
			//compute all possible combinations of four stories
			//////allPossible = computeCombinations(storyBank, 4);
			console.log('printing allPossible...');
			//////console.log(allPossible);
			//from generalTable load variables
			//////programRecord = generalTable.query();
			//////if (programRecord.length == 0) {
				//initialize values
				//////insertProgramRecord(generalTable);


			//6 } else if (programRecord.length == 1) {
			// 	programRecord = programRecord[0];
			// 	//load stored values
			// 	accountIndex = programRecord.get('accountIndex');
			// 	existingAccountIndex = programRecord.get('existingAccountIndex');
			// 	existingAccounts = programRecord.get('existingAccounts');//.toArray();
			// 	existingPersonList = programRecord.get('existingPersonList');//.toArray();
			//6END 	existingSceneList = programRecord.get('existingSceneList');//.toArray();

			//////} else {
				//error should never get here
			//////}			

			// Populate the initial task list.
			//updateList();
			//////updateStoryBankList();
			//////updateAccountList();

			// Ensure that future changes update the list.
			//datastore.recordsChanged.addListener(updateList);
			//////datastore.recordsChanged.addListener(updateStoryBankList);
			//////datastore.recordsChanged.addListener(updateAccountList);
			$('#home-words').html('Welcome Back!');
			$('#dropboxButton').hide();
			console.log('checking each story......');
    		//////checkEachStory();
    		console.log('finish!');
    		//////renderRehearsalBoard();
    		//create dynamic page for each account
    		//createPageForStory();
			//updateListBool = false;
			//link li items to generatePage
    		//////$('ul.rehearsalList li').on('click',
    		//////	function (e) {
    		//////		e.preventDefault();
    		//////		var textList = $(this).find(".storyText");
    		//////		var person = textList[0].innerHTML;
    		//////		var scene = textList[1].innerHTML;
    		//////		changeRehearsalPage(person, scene);
    				//createPageForStory(person, scene);
    		//////	});
		});
	}
	
	// Set the completed status of a task with the given ID.
	function setCompleted(id, completed) {
		taskTable.get(id).set('completed', completed);
	}

	// Delete the record with a given ID.
	function deleteRecord(id) {
		taskTable.get(id).deleteRecord();
	}

	// Render the HTML for a single task.
	function renderTask(id, completed, text) {
		return $('<li>').attr('id', id).append(
				$('<button>').addClass('delete').html('&times;')
			).append(
				$('<span>').append(
					$('<button>').addClass('checkbox').html('&#x2713;')
				).append(
					$('<span>').addClass('text').text(text)
				)
			)
			.addClass(completed ? 'completed' : '');
	}

	// Register event listeners to handle completing and deleting.
	function addListeners() {
		$('span').click(function (e) {
			e.preventDefault();
			var li = $(this).parents('li');
			var id = li.attr('id');
			setCompleted(id, !li.hasClass('completed'));
		});

		$('button.delete').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('li').attr('id');
			deleteRecord(id);
		});
	}

	// Hook form submit and add the new task.
	$('#addForm').submit(function (e) {
		e.preventDefault();
		if ($('#newTask').val().length > 0) {
			insertTask($('#newTask').val());
			$('#newTask').val('');
		}
		return false;
	});

	$('#newTask').focus();
	$('#bank').css('min-height', window.innerHeight);
	console.log('window height is .... ' + window.innerHeight.toString());


});

function displayInfo() {
	$('#dialog').css('display', 'block');
	$('#dialog').dialog();
}

function getObjectComboBox(id) {
	$('#' + id).kendoComboBox({
    	dataTextField: "text",
    	dataValueField: "value",
        dataSource: [
        { text: "bus", value: "bus" },
        { text: "daisy", value: "daisy" },
        { text: "dice", value: "dice"},
        { text: "dome", value: "dome" },
        { text: "hammer", value: "hammer" },
        { text: "heel", value: "heel" },
        { text: "hen", value: "hen"},
        { text: "igloo", value: "igloo" },
        { text: "leaf", value: "leaf"},
        { text: "lock", value: "lock"},
        { text: "lollipop", value: "lollipop" },
        { text: "map", value: "map" },
        { text: "moon", value: "moon"},
        { text: "moose", value: "moose" },
        { text: "peach", value: "peach" },
        { text: "safe", value: "safe" },
        { text: "seal", value: "seal"},
        { text: "smore", value: "smore" },
        { text: "snowflake", value: "snowflake"},
        { text: "suit", value: "suit"},
        { text: "toilet", value: "toilet" },
        ],
        filter: "startswith",
        suggest: true,
        placeholder: "What?"
    });
}
function getVerbComboBox(id) {
	$('#' + id).kendoComboBox({
    	dataTextField: "text",
    	dataValueField: "value",
        dataSource: [
        { text: "balancing", value: "balancing" },
        { text: "bending", value: "bending" },
        { text: "biting", value: "biting"},
        { text: "bouncing", value: "bouncing" },
        { text: "building", value: "building" },
        { text: "burning", value: "burning"},
        { text: "chasing", value: "chasing" },
        { text: "clapping", value: "clapping"},
        { text: "climbing", value: "climbing" },
        { text: "cooking", value: "cooking"},
        { text: "digging", value: "digging"},
        { text: "drinking", value: "drinking" },
        { text: "enlarging", value: "enlarging" },
        { text: "exploding", value: "exploding"},
        { text: "feeding", value: "feeding" },
        { text: "fighting", value: "fighting" },
        { text: "flipping", value: "flipping" },
        { text: "hanging", value: "hanging"},
        { text: "hiding", value: "hiding" },
        { text: "hugging", value: "hugging"},
        { text: "juggling", value: "juggling"},
        { text: "kissing", value: "kissing" },
        { text: "licking", value: "licking" },
        { text: "painting", value: "painting"},
        { text: "piloting", value: "piloting" },
        { text: "pushing", value: "pushing" },
        { text: "repairing", value: "repairing" },
        { text: "rubbing", value: "rubbing"},
        { text: "scratching", value: "scratching" },
        { text: "shooting", value: "shooting"},
        { text: "smelling", value: "smelling"},
        { text: "swinging", value: "swinging" },
        { text: "throwing", value: "throwing" },
        { text: "tickling", value: "tickling"},
        { text: "tying", value: "tying" },
        { text: "washing", value: "washing" },
        { text: "wrapping", value: "wrapping" },
        { text: "zooming", value: "zooming"},
        ],
        filter: "startswith",
        suggest: true,
        placeholder: "Doing?"
    });
}

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready",onDeviceReady,false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64-encoded image data
  // console.log(imageData);

  // Get image handle
  //
  var smallImage = document.getElementById('photoCanvas' + currentPageID);

  // Unhide image elements
  //
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI
  // console.log(imageURI);

  // Get image handle
  //
  //alert(1);
  var largeImage = document.getElementById('photoCanvas' + currentPageID);

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = "data:image/jpeg;base64," + imageURI;
}

// A button will call this function
//
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL });
  $.mobile.changePage($("#" + currentPageID + 'Page'));  
}

// A button will call this function
//
function capturePhotoEdit() {
  // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, allowEdit: true,
    destinationType: destinationType.DATA_URL });
  $.mobile.changePage($("#" + currentPageID + 'Page'));  

}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
    destinationType: destinationType.FILE_URI,
    sourceType: source });
  $.mobile.changePage($("#" + currentPageID + 'Page'));  

}

// Called if something bad happens.
//
function onFail(message) {
  alert('Failed because: ' + message);
}

function alertDismissed() {
    // do something

}

// Show a custom 

//
function showAlert() {
    navigator.notification.alert(
        'Time to Rehearse!',  // message
        alertDismissed,         // callback
        'Rehearse',            // title
        'Got it'                  // buttonName
  	);
}


function playBeep() {
    navigator.notification.beep(3);
}

// Vibrate for 2 seconds
//
function vibrate() {
    navigator.notification.vibrate();

}


//compute all possible hashes
function computeHash(){
	var k = 6;
	//all permutations of length 6; compute the hash and story them
	var allResult = regularComputerCombinations(storyBank, 6);
}
//bank and rehearse schedule
function regularComputerCombinations(bank, k) {
	if (bank.length < k) {
		return [[]]
	} else if (bank.length == k) {
		return [bank]
	} else if (k == 1) {
		var newB = [];
		for (var i=0; i < bank.length; i++) {
			newB.push([bank[i]]);
		}
		return newB;

	} else {
		var allperm = []
		var result1 = regularComputerCombinations(bank.slice(1), k-1);
		var result2 = regularComputerCombinations(bank.slice(1), k);
		for (var i = 0; i < result1.length ; i++) {   
			allperm.push([bank[0]].concat(result1[i]));
		}
		for (var j =0; j < result2.length; j ++) {
			allperm.push(result2[j]);
		}
		return allperm;
	}

}
function computeOverlap(first, second) {
	var overlapCount = 0
	for (var i=0; i<first.length; i++) {
		for (var j=0; j<second.length; j++) {
			if (first[i] == second[j]) overlapCount += 1;
		}
	}
	return overlapCount;
}

function checkOverlappingElements(allPerms, newElement) {
	if (OVERLAP == THREE_OVERLAP) return true;
	for (var i = 0; i < allPerms.length ; i++) {
		var first = allPerms[i];
		if (computeOverlap(first, newElement) > OVERLAP) return false;
	}
	return true;
}

//default is at most three permutations 
function computeCombinations(bank, k) {
	if (bank.length < k) {
		return [[]]
	} else if (bank.length == k) {
		return [bank]
	} else if (k == 1) {
		var newB = [];
		for (var i=0; i < bank.length; i++) {
			newB.push([bank[i]]);
		}
		return newB;

	} else {
		var allperm = []
		var result1 = computeCombinations(bank.slice(1), k-1);
		var result2 = computeCombinations(bank.slice(1), k);
		for (var i = 0; i < result1.length ; i++) {   
			//sconsole.log([bank[0]]+ result1[i]);

			//check if there is any overlap
			var element = [bank[0]].concat(result1[i]);
			if (checkOverlappingElements(allperm, element)) {
				allperm.push(element);
			}
		}
		for (var j =0; j < result2.length; j ++) {
			if (checkOverlappingElements(allperm, result2[j])) {
				allperm.push(result2[j]);
			}
		}
		return allperm;

	}
	
}
