const port = 3000;
const api_key = "keyapikeydukasdas3d2022dad";
const qrcodeTerimnal = require('qrcode-terminal');
var checkReadyWhatsapp = false;

const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    // origins : ["*"],
    origin: ["http://localhost","https://localhost","http://localhost:3000"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "http://localhost,https://localhost,http://localhost:3000",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": true
      });
      res.end();
    }}
  });

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//Jika ingin Login QR Lewat Via Web

// app.get('/', (req, res) => {
//   res.sendFile('index.html', {
//     root: __dirname
//   });
// });


const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
      ],

    },
    authStrategy: new LocalAuth()
  });

client.on('message', msg => {
  if (msg.body == '!ping') {
    msg.reply('pong');
  }
});

//Jika ingin Login QR Lewat Via Terminal

﻿client.on('qr', qr => {
  checkReadyWhatsapp = false;
  qrcodeTerimnal.generate(qr, {small: true});
  console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
  checkReadyWhatsapp = true;
  console.log('Client is ready!'); 
});

client.on('authenticated', () => {
  checkReadyWhatsapp = true;
  console.log('AUTHENTICATED');
});

client.on('auth_failure', function(session) {
  checkReadyWhatsapp = false;
  console.log('auth_failure');
});

client.on('disconnected', (session) => {
  checkReadyWhatsapp = false;
  client.destroy();
  client.initialize();
  console.log('disconnect Whatsapp-bot', session);
});

client.initialize();


// // Socket IO QR Via Web
// io.on('connection', function(socket) {
//   socket.emit('message', 'Connecting...');
//   client.on('qr', (qr) => {
//     console.log('QR RECEIVED', qr);
//     qrcode.toDataURL(qr, (err, url) => {
//       socket.emit('qr', url);
//       socket.emit('message', 'QR Code received, scan please!');
//       checkReadyWhatsapp = false;
//     });
//   });

//   client.on('ready', () => {
//     socket.emit('ready', 'Whatsapp is ready!');
//     socket.emit('message', 'Whatsapp is ready!');
//     checkReadyWhatsapp = false;
//   });

//   client.on('authenticated', () => {
//     socket.emit('authenticated', 'Whatsapp is authenticated!');
//     socket.emit('message', 'Whatsapp is authenticated!');
//     console.log('AUTHENTICATED');
//     checkReadyWhatsapp = true;
//   });

//   client.on('auth_failure', function(session) {
//     socket.emit('message', 'Auth failure, restarting...');
//     checkReadyWhatsapp = false;
//   });

//   client.on('disconnected', (reason) => {
//     socket.emit('message', 'Whatsapp is disconnected!');
//     client.destroy();
//     client.initialize();
//     checkReadyWhatsapp = false;
//   });
// });


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}


// Send message
app.post('/check-number', [
  body('api_key').custom((value, { req }) => {
    if (value != api_key) {
      throw new Error('Invalid Api Key');
    }
    return true;
  }),
  body('number').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
      msg
    }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    if (!checkReadyWhatsapp) {
      return res.status(422).json({
        status: false,
        message: 'Server Belum Siap'
      });
    }


    if (req.body.number.length >= 15 || req.body.number.length <= 10) {
      return res.status(422).json({
        status: false,
        message: 'The number above 15 digit or below 10 digit'
      });
    }

    const number = phoneNumberFormatter(req.body.number);
    

    const isRegisteredNumber = await checkRegisteredNumber(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: 'The number is not registered'
      });
    }

    return res.status(200).json({
      status: true,
      message: 'The number registered'
    });


    
  });


// Send message
app.post('/send-message', [
  body('api_key').custom((value, { req }) => {
    if (value != api_key) {
      throw new Error('Invalid Api Key');
    }
    return true;
  }),
  body('number').notEmpty(),
  body('message').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
      msg
    }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    if (!checkReadyWhatsapp) {
      return res.status(422).json({
        status: false,
        message: 'Server Belum Siap'
      });
    }

    if (req.body.number.length >= 15 || req.body.number.length <= 10) {
      return res.status(422).json({
        status: false,
        message: 'The number above 15 digit or below 10 digit'
      });
    }
    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;
    const isRegisteredNumber = await checkRegisteredNumber(number);

    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: 'The number is not registered'
      });
    }

    client.sendMessage(number, message).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
  });


const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
      );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('api_key').custom((value, { req }) => {
    if (value != api_key) {
      throw new Error('Invalid Api Key');
    }
    return true;
  }),
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req).formatWith(({
      msg
    }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped()
      });
    }

    if (!checkReadyWhatsapp) {
      return res.status(422).json({
        status: false,
        message: 'Server Belum Siap'
      });
    }

    let chatId = req.body.id;
    const groupName = req.body.name;
    const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});


server.listen(port, function() {
  console.log('App running on *: ' + port);
});
