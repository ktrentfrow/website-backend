# website-backend
Backend for my website

# To deploy
export DB_PASSWORD="find in aws"
export MY_CERT="find in aws"
ssh -i "ToddsBackendKey.pem" ubuntu@ec2-3-84-147-88.compute-1.amazonaws.com
cd website-backend
git pull
npm run build
npm run start& --Obsolete
./node_modules/pm2/bin/pm2 start dist/src/app.js
./node_modules/pm2/bin/pm2 list

ps aux - To get pid
sudo kill -9 <pid>
For More Info:
https://www.npmjs.com/package/pm2