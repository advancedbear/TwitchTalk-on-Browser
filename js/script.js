var client_id = 'h7whwlyq3syva61fwceaxzq7h42jc1';
var token = null;
var user = null;

var uttr = new SpeechSynthesisUtterance();

$(document).ready(function() {
	if(sessionStorage.volume!=null) $("#volume").val(sessionStorage.volume);
	if(sessionStorage.speed!=null) $("#speed").val(sessionStorage.speed);
	if(sessionStorage.pitch!=null) $("#pitch").val(sessionStorage.pitch);

	$("#volume_val").text(parseFloat($("#volume").val()).toFixed(1));
	$("#speed_val").text(parseFloat($("#speed").val()).toFixed(1));
	$("#pitch_val").text(parseFloat($("#pitch").val()).toFixed(1));

	$('#volume').on('input', function(){
		$("#volume_val").text(parseFloat($(this).val()).toFixed(1));
		uttr.volume = parseFloat($(this).val());
		sessionStorage.volume = parseFloat($(this).val());
	})
	$('#speed').on('input', function(){
		$("#speed_val").text(parseFloat($(this).val()).toFixed(1));
		uttr.rate = parseFloat($(this).val());
		sessionStorage.speed = parseFloat($(this).val());
	})
	$('#pitch').on('input', function(){
		$("#pitch_val").text(parseFloat($(this).val()).toFixed(1));
		uttr.pitch = parseFloat($(this).val());
		sessionStorage.pitch = parseFloat($(this).val());
	})

    Twitch.init({clientId: client_id}, function(err, stat) {
        if (stat.authenticated) {
			var embed;
			token = Twitch.getToken();
			Twitch.api({method: 'user'}, function(error, userstatus){
				user = userstatus;
				$('#username').text("Logged in as \""+user.name+"\"");
				$('#username').attr('user-id', user.name);
				$('#username').show();
			});
			$('#button_img').attr("src", "img/Loggedin.png");
			$('#loginTwitch').attr("onclick", "");
			location.hash = '';
        } else {
			$('#connButton').prop('disabled', true);
		}
	});
});


var loginTwitch = function(){
    Twitch.login({
		scope: ['user_read', 'chat_login'],
		force_verify: true
	});
};

var Connect = function(){
	$('#connButton').attr('disabled', 'true');
	$('#connButton').text("Connected!")
	var channel = $('#channel').val();
	var tmi_options = {
        connection: {
			reconnect: true,
			secure: true
        },
        identity: {
            username: user.name,
            password: "oauth:"+token
        },
        channels: ["#"+channel]
	};
	var client = new tmi.client(tmi_options);

	client.on('chat', function(ch, userstate, message, self){
		let dt = new Date();
		let hour = ("0"+dt.getHours()).slice(-2);
		let min = ("0"+dt.getMinutes()).slice(-2);
		time = hour+":"+min;
		let from = userstate["username"];
		var uri = "(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)";
		$('.loglist').append("<tr><td>"+time+"</td><td>"+from+"</td><td>"+escapeHTML(message)+"</td></tr>");
		message = message.replace(new RegExp(uri, 'g'), ';webURL;');
		if(isEnglish(message)){
			uttr.text = message;
			uttr.lang = 'en-US';
			speechSynthesis.speak(uttr);
		} else {
			uttr.text = message;
			uttr.lang = 'ja-JP';
			speechSynthesis.speak(uttr);
		}

	});

	let wd = $('.description').width();
	let iframe = "<iframe src=\"https://player.twitch.tv/?channel="+channel+"&muted=true\""
		+ " height=\""+wd*.75+"\" width=\""+ wd +"\" frameborder=\"0\""
		+ " scrolling=\"no\" allowfullscreen=\"false\"></iframe>"
	$('#twitch-embed').append(iframe);
	$('.button_wrapper').css('display', 'none');
	$('#twitch-embed').slideDown();

	client.connect().then(function(data) {
	}).catch(function(err) {
		$('#connButton').prop('disabled', false);
		$('#connButton').text("Connect")
		alert("Connection failed.")
	});;
}

var isEnglish = function(message){
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? false : true ;
};

var enVoiceTest = function(){
	uttr.text="This is the test message. Please check the voice quality.";
	uttr.lang="en-US";
	speechSynthesis.speak(uttr);
}

var jpVoiceTest = function(){
	uttr.text="これはテストメッセージです。音声の品質を確認して下さい。";
	uttr.lang="ja-JP";
	speechSynthesis.speak(uttr);
}

var openOptions = function(){
	if($('.options').css('display')=='none'){
		$('.options').slideDown();
	} else {
		$('.options').slideUp();
	}
}

var escapeHTML = function (str) {
    return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
};

var escapeJs = function (str) {
    return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\//g, '\\/')
            .replace(/</g, '\\x3c')
            .replace(/>/g, '\\x3e')
            .replace(/(0x0D)/g, '\r')
            .replace(/(0x0A)/g, '\n');
};

var unEscapeJs = function (str) {
    return str
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\//g, '/')
            .replace(/\\x3c/g, '<')
            .replace(/\\x3e/g, '>')
            .replace(/\\\\/g, '\\');
};