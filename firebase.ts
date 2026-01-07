
// Configuração do Firebase
// Nota: Em um ambiente real, estas chaves viriam de variáveis de ambiente
const firebaseConfig = {
  apiKey: "AIzaSyAs-FakeKey-For-Demo-Only",
  authDomain: "apae-eventos.firebaseapp.com",
  projectId: "apae-eventos",
  storageBucket: "apae-eventos.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicializa o Firebase (Compat mode para simplificar importação via CDN)
declare var firebase: any;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  
  // Habilita persistência offline para Android/Windows (Navegador)
  firebase.firestore().enablePersistence().catch((err: any) => {
      if (err.code === 'failed-precondition') {
          console.warn("Persistência falhou: múltiplas abas abertas.");
      } else if (err.code === 'unimplemented') {
          console.warn("O navegador atual não suporta persistência.");
      }
  });
}

export const db = firebase.firestore();
export default firebase;
