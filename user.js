const readline = require('readline');
const path = require('path');
const fs = require('fs');
const secrets = require('./index.js');

// Generate secrets folder
if(!fs.existsSync(path.join(__dirname, "secrets"))) {
    fs.mkdirSync(path.join(__dirname, "secrets"));
}

/**
 * Ask a question and wait for user input
 * @param {String} query 
 * @returns 
 */
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

(async () => {
    const name = await askQuestion("Type the name of the secret: ");
    const shares_amount = await askQuestion("Type the amount of shares: ");
    const threshold_amount = await askQuestion("Type the threshold amount: ");
    const charLength = await askQuestion("Type the length of the secret: ");

    const secret = secrets.genSecret(parseInt(shares_amount, 10), parseInt(threshold_amount, 10), parseInt(charLength, 10), name);

    secrets.storeShares(secret.shares, name, path.join(__dirname, "secrets"));

    console.log(`Can the generated shares be used to recreate the secret?: ${secrets.getSecretFromFiles(name, path.join(__dirname, "secrets")) === secret.secret}`)
    
    console.log(`\n\nSecret: ${secret.secret}\n\n`)

    process.exit(0);

})();