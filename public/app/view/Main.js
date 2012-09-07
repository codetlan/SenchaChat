Ext.define("Senchat.view.Main", {
	extend: 'Ext.Panel',
	requires: ['Ext.TitleBar'],
	config: {

		title: 'Welcome',
		iconCls: 'home',

		styleHtmlContent: true,
		scrollable: true,

		items: [{
			docked: 'bottom',
			xtype: 'toolbar',
			items: [{
				xtype: 'textfield',
				placeHolder: '...',
				flex: 5
			}, {
				xtype: 'button',
				text: 'Send',
				ui: 'forward',
				iconMask: true,
				margin: 5,
				flex: 1,
				handler: function(btn) {
					var message = btn.up('container').items.items[0];
					if(message.getValue()){
						socket.emit('sendchat', message.getValue());
						message.reset();
					}
				}
			}]
		}],
		html: ['<div id="chat"></div>'].join("")
	},
	initialize: function() {
		this.callParent(arguments);
		this.configureSocket();
	},
	configureSocket : function() {
		var me = this;
		//socket = io.connect('http://localhost:8080');
		socket = io.connect('http://senchat.jit.su');
		// on connection to server, ask for user's name with an anonymous callback
		socket.on('connect', function() {
			//ask the user the name when the client conects 
			Ext.Msg.prompt('Welcome!', 'What\'s your name going to be today?', function(buttonId, value) {
				if (buttonId == 'ok') {
					socket.emit('adduser', value);
				} else {
					socket.emit('adduser', "Guess");
				}
			}, null, false, null, {
				autoCapitalize: true,
				placeHolder: 'Name please...'
			});
		});
		socket.on('updatechat', function(username, data) {
			Ext.get('chat').createChild('<b>' + username + ':</b> ' + data + '<br>');
		});
	}
});
