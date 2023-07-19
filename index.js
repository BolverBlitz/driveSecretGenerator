const randomstring = require('randomstring');
const shamirs = require('shamirs-secret-sharing');
const path = require('path');
const fs = require('fs');

/**
 * Generate a new secret based on the provided parameters
 * @param {Number} shares_amount 
 * @param {Number} threshold_amount 
 * @param {Number} length 
 * @param {String} name 
 * @param {String} charset 
 * @returns 
 */
const genSecret = (shares_amount, threshold_amount, length, name, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
    const secret = randomstring.generate({
        length: length,
        charset: charset
    });

    if (name === undefined) {
        name = randomstring.generate({
            length: 16,
            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        });
    }

    const shares = shamirs.split(secret, { shares: shares_amount, threshold: threshold_amount });
    const recovered_first = shamirs.combine(shares.slice(0, threshold_amount));
    const recovered_lase = shamirs.combine(shares.slice(shares_amount - threshold_amount, shares_amount));
    const recovered_total = shamirs.combine(shares);

    if (secret === recovered_first.toString() && secret === recovered_lase.toString() && secret === recovered_total.toString()) {
        return { "secret": secret, "name": name, "shares": shares };
    } else {
        false
    }
}

/**
 * 
 * @param {Array} shares 
 * @param {String} name 
 * @param {String} path 
 */
const storeShares = (shares, name, path) => {
    for (let i = 0; i < shares.length; i++) {
        fs.writeFileSync(path + `/${name}_share_${i + 1}_${shares.length}.bin`, shares[i]);
    }
}

/**
 * 
 * @param {String} name 
 * @param {String} path 
 * @returns 
 */
const getSecretFromFiles = (name, path) => {
    const files = fs.readdirSync(path);
    const shares = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].startsWith(name)) {
            shares.push(fs.readFileSync(path + `/${files[i]}`));
        }
    }

    return shamirs.combine(shares).toString();
}

module.exports = {
    genSecret,
    storeShares,
    getSecretFromFiles
}