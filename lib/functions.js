const axios = require('axios');

/**
 * @description Télécharge une ressource depuis une URL et la renvoie sous forme de buffer.
 * @param {string} url - L'URL de la ressource.
 * @param {object} [options={}] - Options pour la requête axios.
 * @returns {Promise<Buffer|null>} Le buffer de la ressource ou null en cas d'erreur.
 */
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
            },
            ...options,
            responseType: 'arraybuffer',
        });
        return res.data;
    } catch (e) {
        console.error('Erreur lors de la récupération du buffer :', e);
        return null;
    }
};

/**
 * @description Récupère les IDs des administrateurs d'un groupe.
 * @param {Array<object>} participants - La liste des participants du groupe.
 * @returns {Array<string>} Un tableau des JIDs des administrateurs.
 */
const getGroupAdmins = (participants) => {
    return participants
        .filter(p => p.admin !== null)
        .map(p => p.id);
};

/**
 * @description Génère un nom de fichier aléatoire avec une extension donnée.
 * @param {string} ext - L'extension du fichier (ex: ".jpg").
 * @returns {string} Le nom de fichier aléatoire.
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * @description Convertit un grand nombre en une version abrégée (ex: 1200 -> 1.2K).
 * @param {number} eco - Le nombre à convertir.
 * @returns {string|number} Le nombre formaté ou le nombre original.
 */
const h2k = (eco) => {
    const lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    const ma = Math.log10(Math.abs(eco)) / 3 | 0;
    if (ma === 0) return eco;
    const ppo = lyrik[ma];
    const scale = Math.pow(10, ma * 3);
    let formatt = (eco / scale).toFixed(1);
    if (/\.0$/.test(formatt)) {
        formatt = formatt.slice(0, -2);
    }
    return formatt + ppo;
};

/**
 * @description Vérifie si une chaîne de caractères est une URL valide.
 * @param {string} url - La chaîne à tester.
 * @returns {boolean} True si c'est une URL, False sinon.
 */
const isUrl = (url) => {
    const regex = new RegExp(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
        'gi'
    );
    return regex.test(url);
};

/**
 * @description Formate un objet JSON avec une indentation de 2 espaces.
 * @param {object} string - L'objet à formater.
 * @returns {string} La chaîne JSON formatée.
 */
const Json = (string) => {
    return JSON.stringify(string, null, 2);
};

/**
 * @description Convertit un nombre de secondes en un format de temps lisible.
 * @param {number} seconds - Le nombre de secondes.
 * @returns {string} Le temps formaté (ex: "1 day, 2 hours, 3 minutes").
 */
const runtime = (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + (d === 1 ? ' jour, ' : ' jours, ') : '';
    const hDisplay = h > 0 ? h + (h === 1 ? ' heure, ' : ' heures, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' seconde' : ' secondes') : '';

    return dDisplay + hDisplay + mDisplay + sDisplay;
};

/**
 * @description Met en pause l'exécution pendant un certain temps.
 * @param {number} ms - Le temps de pause en millisecondes.
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * @description Récupère des données JSON à partir d'une URL.
 * @param {string} url - L'URL de la ressource JSON.
 * @param {object} [options={}] - Options pour la requête axios.
 * @returns {Promise<object|null>} Les données JSON ou null en cas d'erreur.
 */
const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
            },
            ...options,
        });
        return res.data;
    } catch (err) {
        console.error('Erreur lors de la récupération du JSON :', err);
        return null;
    }
};

module.exports = {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
};
              
