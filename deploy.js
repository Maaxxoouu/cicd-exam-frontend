const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sftp = new SftpClient();

const config = {
    host: process.env.VPS_HOST,
    username: process.env.VPS_USER,
    privateKey: fs.readFileSync(process.env.VPS_KEY_PATH),
    passphrase: process.env.VPS_KEY_PASSPHRASE,
    port: 55555
};

const localDir = path.join(__dirname, process.env.LOCAL_BUILD_DIR);
const remoteDir = process.env.VPS_DEPLOY_DIR;

async function main() {
    try {
        console.log(`🔄 Connexion au serveur ${config.host}...`);
        await sftp.connect(config);
        console.log('✅ Connecté !\n');

        console.log(`🗑️ Nettoyage du dossier distant: ${remoteDir}`);

        const exists = await sftp.exists(remoteDir);
        if (!exists) {
            console.log('Le dossier distant n\'existe pas, création en cours...');
            await sftp.mkdir(remoteDir, true);
        } else {
            await sftp.rmdir(remoteDir, true);
            await sftp.mkdir(remoteDir, true);
        }

        console.log(`🚀 Upload des fichiers de ${localDir} vers ${remoteDir}...`);

        await sftp.uploadDir(localDir, remoteDir);

        console.log('\n🎉 Déploiement terminé avec succès !\n');
    } catch (err) {
        console.error('❌ Erreur lors du déploiement :', err.message);
    } finally {
        sftp.end();
    }
}

if (!fs.existsSync(localDir)) {
    console.error(`❌ Le dossier ${localDir} n'existe pas. As-tu lancé 'npm run build' ?`);
    process.exit(1);
}

main();