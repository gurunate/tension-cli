'use strict';

const request = require('request');
const tensionConfig = require('../tension.json');
const ora = require('ora');

const spinner = ora('fetching templates');

/**
 * Gather an active list of available templates.
 *
 * @param url
 * @param pattern
 * @returns {Promise}
 */
function retrieveTemplates(url, pattern) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            headers: {
                'User-Agent': 'tension-cli'
            }
        }, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const repos = JSON.parse(body);

                let templates = [];

                if (url.match(new RegExp('github.com'))) {
                    templates = repos.filter(r => r.name.match(new RegExp(pattern))).map(r => {
                        return {
                            url,
                            pattern,
                            name: r.name,
                            description: r.description
                        };
                    });
                } else {
                    templates = repos.values.filter(r => r.name.match(new RegExp(pattern))).map(r => {
                        return {
                            url,
                            pattern,
                            name: r.name,
                            description: r.description
                        };
                    });
                }

                resolve(templates);
            }
        });
    });
}

/**
 *
 */
function fetch() {
    return new Promise((resolve, reject) => {
        spinner.start();

        let promises = [];

        tensionConfig.repositories.forEach(repo => {
            promises.push(retrieveTemplates(repo.url, repo.pattern));
        });

        Promise.all(promises).then(templates => {
            spinner.stop();
            
            resolve(templates.reduce((a, b) => a.concat(b)));
        }).catch(err => {
            spinner.stop();

            reject(err);
        });
    });
}

module.exports = {
    fetch
};

