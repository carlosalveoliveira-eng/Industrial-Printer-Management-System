import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const USERNAME = 'tiadmin';
const EMAIL = `${USERNAME}@gestao-impressoras.local`;
const PASSWORD = 'mudar@123';

async function setupAdmin() {
  console.log(`Verificando/criando usuário administrador '${USERNAME}' (${EMAIL})...`);
  let user = null;

  try {
    // Try sign in first (if already created)
    const signinRes = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    user = signinRes.user;
    console.log(`Usuário ${USERNAME} já existe no Firebase Auth (UID: ${user.uid}). Login com senha inicial bem-sucedido.`);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      console.log(`Usuário ${USERNAME} não existe ainda. Criando no Firebase Auth...`);
      try {
        const createRes = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
        user = createRes.user;
        console.log(`Usuário ${USERNAME} criado com sucesso no Firebase Auth! (UID: ${user.uid})`);
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          console.log(`Usuário ${USERNAME} já estava cadastrado (a senha pode ter sido alterada pelo administrador).`);
          return;
        } else {
          console.error('Erro ao criar usuário no Firebase Auth:', createErr);
          throw createErr;
        }
      }
    } else {
      console.warn('Nota de verificação de autenticação:', err.message);
    }
  }

  if (user) {
    console.log(`Configurando perfil 'admin' no Cloud Firestore para UID: ${user.uid}...`);
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      username: USERNAME,
      email: EMAIL,
      name: 'Administrador TI',
      role: 'admin',
      mustChangePassword: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`Perfil 'admin' garantido com sucesso no Cloud Firestore para ${USERNAME}!`);
  }
}

setupAdmin().then(() => {
  console.log('Operação de inicialização concluída com sucesso!');
  process.exit(0);
}).catch(err => {
  console.error('Falha na inicialização do administrador:', err);
  process.exit(1);
});
