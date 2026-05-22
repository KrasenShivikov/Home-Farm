const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.resolve(__dirname, '../drizzle/0006_amusing_magik.sql');
const content = fs.readFileSync(filePath, 'utf8');
console.log(crypto.createHash('sha256').update(content).digest('hex'));
