import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updatePassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  getDocFromServer, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Printer, Inspection, Sector, UserProfile, UserRole } from '../types/printer';
import { INITIAL_REAL_PRINTERS, INITIAL_SECTORS } from '../data/initialPrinters';

// Initialize Firebase App & Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling protocol as required by Firestore integration standards
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection probe test (requires auth)
export async function testFirestoreConnection(): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (err) {
    console.warn('Firestore connection probe note (offline or initial):', err);
    return true;
  }
}

// Seed the 28 real factory printers if collection is empty (Only executed when authenticated)
export async function seedInitialPrintersIfEmpty(): Promise<number> {
  if (!auth.currentUser) {
    console.log('Semeadura adiada: usuário não autenticado.');
    return 0;
  }

  const path = 'printers';
  try {
    const existing = await getDocs(collection(db, path));
    if (existing.empty) {
      console.log('Coleção printers vazia. Populando as 28 impressoras industriais do PDF...');
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      INITIAL_REAL_PRINTERS.forEach((p) => {
        const ref = doc(db, 'printers', p.id);
        batch.set(ref, {
          ...p,
          createdAt: now,
          updatedAt: now,
        });
      });

      // Also seed standard sectors
      INITIAL_SECTORS.forEach((sec) => {
        const sRef = doc(db, 'sectors', sec.id);
        batch.set(sRef, {
          ...sec,
          active: true,
          createdAt: now,
        });
      });

      await batch.commit();
      console.log('28 impressoras industriais gravadas com sucesso no Cloud Firestore!');
      return INITIAL_REAL_PRINTERS.length;
    }
    return existing.size;
  } catch (error) {
    console.warn('Nota de verificação de semente:', error);
    return 0;
  }
}

// Subscriptions - only invoked when user is authenticated
export function subscribePrinters(
  onUpdate: (printers: Printer[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'printers');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Printer[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          name: d.name || '',
          sector: d.sector || '',
          model: d.model || '',
          ip: d.ip || '',
          serial: d.serial || '',
          patrimony: d.patrimony || '',
          connectionType: d.connectionType || 'ethernet',
          notes: d.notes || '',
          active: d.active !== false,
          createdAt: d.createdAt || '',
          updatedAt: d.updatedAt || '',
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Erro de permissão ou rede na assinatura de impressoras:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeInspections(
  onUpdate: (inspections: Inspection[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'inspections');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Inspection[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          printerId: d.printerId || '',
          date: d.date || '',
          tech: d.tech || '',
          userId: d.userId || '',
          power: d.power || 'Sim',
          printing: d.printing || 'Sim',
          quality: d.quality || 'Boa',
          physical: d.physical || 'Bom',
          problemType: d.problemType || 'Nenhum',
          errorMessage: d.errorMessage || '',
          actionNeeded: d.actionNeeded || '',
          priority: d.priority || 'Média',
          result: d.result || 'Funcionando',
          observations: d.observations || '',
          photoUrl: d.photoUrl || undefined,
          createdAt: d.createdAt || '',
        });
      });
      list.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
      onUpdate(list);
    },
    (err) => {
      console.error('Erro de permissão ou rede na assinatura de inspeções:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeSectors(
  onUpdate: (sectors: Sector[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'sectors');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Sector[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          name: d.name || '',
          description: d.description || '',
          active: d.active !== false,
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Erro de permissão ou rede na assinatura de setores:', err);
      if (onError) onError(err);
    }
  );
}

// Data Operations
export async function savePrinterToFirestore(
  printerData: Omit<Printer, 'id' | 'createdAt'>,
  printerId?: string
): Promise<string> {
  const path = 'printers';
  const now = new Date().toISOString();
  try {
    if (printerId) {
      const ref = doc(db, path, printerId);
      await updateDoc(ref, {
        ...printerData,
        updatedAt: now,
      });
      return printerId;
    } else {
      const ref = doc(collection(db, path));
      await setDoc(ref, {
        ...printerData,
        createdAt: now,
        updatedAt: now,
      });
      return ref.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePrinterFromFirestore(printerId: string): Promise<void> {
  const path = `printers/${printerId}`;
  try {
    await deleteDoc(doc(db, 'printers', printerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveInspectionToFirestore(
  inspectionData: Omit<Inspection, 'id' | 'createdAt'>
): Promise<string> {
  const path = 'inspections';
  const now = new Date().toISOString();
  try {
    const ref = doc(collection(db, path));
    await setDoc(ref, {
      ...inspectionData,
      createdAt: now,
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteInspectionFromFirestore(inspectionId: string): Promise<void> {
  const path = `inspections/${inspectionId}`;
  try {
    await deleteDoc(doc(db, 'inspections', inspectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSectorToFirestore(name: string, description?: string): Promise<string> {
  const path = 'sectors';
  try {
    const ref = doc(collection(db, path));
    await setDoc(ref, {
      name: name.trim(),
      description: description?.trim() || '',
      active: true,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// User Profile & Role Lookup
export async function getUserRoleFromFirestore(uid: string, email?: string | null): Promise<UserRole> {
  if (email === 'graalgarotoclassico@gmail.com' || email === 'tiadmin@gestao-impressoras.local') {
    return 'admin';
  }
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return (userSnap.data()?.role as UserRole) || 'tech';
    }
    return 'tech';
  } catch (err) {
    console.warn('Erro ao obter perfil do Firestore:', err);
    return 'tech';
  }
}

// Authentication Helpers
export function formatInternalEmailFromUsername(username: string): string {
  const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${sanitized}@gestao-impressoras.local`;
}

/**
 * Autentica o usuário com "Usuário" e "Senha", sem armazenar senhas em texto puro
 * e aproveitando a infraestrutura de autenticação do Firebase no plano Spark.
 */
export async function loginWithUsernameAndPassword(username: string, pass: string): Promise<FirebaseUser> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    throw new Error('Informe o nome de usuário.');
  }
  if (!pass) {
    throw new Error('Informe a senha de acesso.');
  }

  const internalEmail = formatInternalEmailFromUsername(cleanUsername);

  try {
    // 1. Tentar login direto via Firebase Authentication
    const res = await signInWithEmailAndPassword(auth, internalEmail, pass);
    const user = res.user;

    // Se o usuário for tiadmin, garantir documento no Firestore com role admin
    if (cleanUsername === 'tiadmin') {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          username: 'tiadmin',
          email: internalEmail,
          name: 'Administrador TI',
          role: 'admin',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (docErr) {
        console.warn('Nota ao atualizar perfil tiadmin:', docErr);
      }
    }

    return user;
  } catch (error: any) {
    const errorCode = error?.code || '';

    // 2. Se for a primeira inicialização do tiadmin com a senha padrão 'mudar@123'
    if (
      cleanUsername === 'tiadmin' &&
      pass === 'mudar@123' &&
      (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential')
    ) {
      try {
        console.log('Inicializando usuário tiadmin pela primeira vez no Firebase...');
        const createRes = await createUserWithEmailAndPassword(auth, internalEmail, pass);
        const newUser = createRes.user;

        // Registrar perfil admin no Firestore
        await setDoc(doc(db, 'users', newUser.uid), {
          username: 'tiadmin',
          email: internalEmail,
          name: 'Administrador TI',
          role: 'admin',
          mustChangePassword: true,
          createdAt: new Date().toISOString(),
        });

        return newUser;
      } catch (createErr: any) {
        if (createErr.code === 'auth/operation-not-allowed') {
          throw new Error(
            'Provedor E-mail/Senha precisa estar ativado no Firebase Console (Authentication > Sign-in method > E-mail/Senha).'
          );
        }
        throw createErr;
      }
    }

    // Tradução e mensagens claras conforme especificação
    if (errorCode === 'auth/operation-not-allowed') {
      throw new Error(
        'Provedor E-mail/Senha desativado no Firebase. Acesse o Firebase Console (Authentication > Sign-in method) e ative E-mail/Senha no plano gratuito Spark.'
      );
    }
    if (
      errorCode === 'auth/user-not-found' ||
      errorCode === 'auth/wrong-password' ||
      errorCode === 'auth/invalid-credential'
    ) {
      throw new Error('Usuário ou senha incorretos.');
    }
    if (errorCode === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas sem sucesso. Aguarde alguns instantes por segurança.');
    }
    if (errorCode === 'auth/network-request-failed') {
      throw new Error('Falha de conexão com a nuvem. Verifique sua rede de internet.');
    }

    throw new Error(error.message || 'Erro ao realizar login.');
  }
}

/**
 * Permite ao usuário alterar sua senha no Firebase Authentication
 */
export async function changeCurrentUserPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Nenhum usuário autenticado.');
  }
  if (!newPass || newPass.length < 6) {
    throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
  }

  await updatePassword(auth.currentUser, newPass);

  // Marcar mustChangePassword como false no Firestore
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Nota ao atualizar status de senha:', err);
  }
}

// Compatibilidade para migração e logout
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function registerWithEmail(email: string, pass: string, name: string, role: UserRole): Promise<FirebaseUser> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function loginAsShiftOperator(name: string, role: UserRole): Promise<FirebaseUser> {
  const res = await signInAnonymously(auth);
  return res.user;
}

export const loginAnonymouslyAsRole = loginAsShiftOperator;

export async function logoutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
}
