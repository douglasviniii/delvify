
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// A inicialização do SDK Admin deve ocorrer apenas uma vez.
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "venda-fcil-pdv",
        clientEmail: "firebase-adminsdk-fbsvc@venda-fcil-pdv.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3leDeVF7eOtbH\n9RAltEF0J90wgqhW1AG/w+E24ylGewS5oecUrR9VJ2FQTMHbn7Ig/QunrZ6ulXtx\nGcHZYMxmjvBfn+2qXqHq8VQmmFgyO0TV4UlB1KjWB1Y57s5t27sTcbY/21xtIe8L\n1dRX+Eo3U+HcFnAz500g1u+F7SZwRBmGvjq0Sopdv65F0/SAu/oxAr29nG5p3P4M\nloxT3wkdPnRw3dsBKWnHCOdMMIWW4YhLdSOMjbEKRd1A19i1xBOKyAKa4AMnceII\nE9q7ohtwr2allsWj0rWaKammFkm9OD2cdN5uZaTpvsgWG4fSz2aK2S4UcPv5O7DM\nIzAf/M+pAgMBAAECggEADjkWA7eO5YHyualga8FiOErtrt2agnvVldvNMCx+czv46A\nlFapIdqTRLxBL3DQ7JBb4y8jl+UtN+qkFoQ3tt0HXPM6R3hLGBHOktaJTder7pFV\nsQnMDIX6oiFNon2gP9XgEZ6zz1DyAVD5lYXGlp2pd02gABZ7cSP8f1yzkCFKQvR7\n+X4GrYh3tiXSdcUeqt/aGRLQhFY0qeaN5iy3sA2zScac83G61wGXhNiaPnjzk8xw\nMla1u2+rdIdsvG6UzQ4z6Pf+O8qnJxgYkq3hk0nnU1BJggGughNV4aKJ9KIM3uwC\nVaMHrXfpYPMgkMWWTZO+VBwdNMm6rIaY27NeynJVAQKBgQDtEOTmYLP8u5B31VIW\nkqjXEfxXB+vFSTF9sWGYHN5nE6RuPnnUdWOQplFmIuoH1PbbAjvpoRiQVNBiby80\nx7wVw61Q/LU56s46FL9ZdQt+3hwtyPUgpBp2Cl0mh5TrIGBn4+e7V5WVfGzj0xd/\nTmNrn9F97CZJC/PL/eQ0T7eUqQKBgQDGP4JPFg/23Cv3voJJOTfWfkQaqBDF9lzx\n5XVPIhpS0REy4n9wiQp/62KwCqES+YkDmnEeiNKRPfOECliX8r7KNWcBq4i6KVj1\nAnB+eAhCHwUaqIAdWboUA11u0qYGSPNgVht2ZS3v29CB6rXg/hUS6AhvTbm0zGf1\n1R+EDpVDAQKBgQCpuvDH6PC0wG28/mRZeQOdiGkMvsUVaUQf5AIl8HVjg3K049JC\nRRHWHN4mrFS26skbIMxYh1iY7cCM2WII/gAx7PmIBIaUQwMIHpapq91hJhEyzrCC\ngDvZy63JykTa20Fq4IenYBve/UjRDO/D3BHemnxZFdyLbB1PLiZXNcQQkQKBgG6e\nET+/t7iusXnTOy9QVe/BFI8rJ/DNvp7awdId3UJIlagm6aUJUmp+FNrVk3ra8bCp\nBGVdQuD4CGCsxTJDqGF72rX72JbHa3OKoOpwX2tFk7uEObgm0MVJ+2BS+YCYQ/SF\nF13ApxknNfjH1iRsoaWjAtHYNL7FL1zkRmmRGYgBAoGACAS0/2bINoTlgCXXF+Sf\nzvqHkiKe+M1y+MILtBPFvnCKZckATf1vvdB6i2Fp2ipNoBZFKaWENgBT5DYw1x9O\nHv61zjxGdsQM1pXlG9aTotbYkt596VFMExUddUXdppKSMXsi+Azs6lFFj8ZGXLZz\nQkDOPStxn2F/LBZkbjX74gs=\n-----END PRIVATE KEY-----\n",
      }),
      storageBucket: 'venda-fcil-pdv.appspot.com',
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error('Falha na inicialização do Firebase Admin SDK:', error.stack);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
