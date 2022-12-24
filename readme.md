###Whatsapp-Api By whatsapp-web.js (wwebjs.dev),
###Login QR via terminal dan QR via Web
###Doc : docs.wwebjs.dev

TUTORIAL INSTALL Node JS di Localhost
yarn install

node app.js

###TUTORIAL INSTALL NODE JS NGINX PM2 di VPS
###APT GET UDPDATE DAHULU
sudo apt-get update


###JIKA INGIN GANTI GANTI PORT SSH
nano /etc/ssh/sshd_config

systemctl restart sshd


###PUPETTER
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

sudo apt-get install -y libgbm-dev


###INSTALL NODE JS 16.x
curl -s https://deb.nodesource.com/setup_16.x | sudo bash

sudo apt-get update

sudo apt-get install nodejs -y

sudo apt-get install yarn -y


###contoh TESTING PROJECT NODE JS
cd ~

nano hello.js

###ISI Nano hello.js
const http = require('http');
const hostname = 'localhost';
const port = 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
###END Nano

node hello.js

###NGINX
apt install nginx -y

nano /etc/nginx/sites-available/sites-name.com

###ISI Nano
server {
        listen 80;
        listen [::]:80;
        root /root;
        server_name sites-name.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
###End Nano

ln -s /etc/nginx/sites-available/sites-name.com /etc/nginx/sites-enabled/sites-name.com

nginx -t

systemctl restart nginx

###INSTALL PM2
npm install pm2@latest -g

pm2 startup systemd

systemctl start pm2-root

###INSTALL WA.ZIP VIA WGET
cd ~

mkdir wa

cd wa

###wget file menggunkan transfer.sh 
wget .....

###testing apakah suskses
node app.js

###jika sukses, jalankan via pm2
pm2 start app.js

pm2 save

###SSL
sudo apt install certbot python3-certbot-nginx

sudo certbot --nginx -d sites-name.com

sudo systemctl status certbot.timer

sudo certbot renew --dry-run RENEW


###SEKURITI TAMBAHAN UFW, BOLEH DIGUNKAN BOLEH TIDAK
sudo apt-get install -y ufw

sudo ufw allow 22

sudo ufw allow 3000

sudo ufw allow 'Nginx Full'

sudo ufw enable