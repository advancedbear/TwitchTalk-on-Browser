var client_id = 'h7whwlyq3syva61fwceaxzq7h42jc1';
var token = null;
var user = null;

var uttr = new SpeechSynthesisUtterance();

$(document).ready(function() {
    Twitch.init({clientId: client_id}, function(err, stat) {
        if (stat.authenticated) {
			token = Twitch.getToken();
			Twitch.api({method: 'user'}, function(error, userstatus){
				user = userstatus;
				console.log(user);
				$('#username').text("Logged in as \""+user.name+"\"");
				$('#username').show();
			});
			$('#button_img').attr("src", "img/Loggedin.png");
			$('#loginTwitch').attr("onclick", "");
            console.log("oauth:" + token);
        } else {
			$('#connButton').attr('disabled', 'true');
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
	console.log(user.name);
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
		$('.loglist').append("<tr><td>"+time+"</td><td>"+from+"</td><td>"+message+"</td></tr>");
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

	client.connect().then(function(data) {
	}).catch(function(err) {
		$('#connButton').attr('disabled', 'false');
		$('#connButton').text("Connect")
		alert("Connection failed.")
	});;
}

var isEnglish = function(message){
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? false : true ;
};