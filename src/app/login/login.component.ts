// import { Router } from '@angular/router';
// import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// import { AuthService } from 'src/Services/auth-service.service';
// import { AngularFireDatabase } from '@angular/fire/compat/database';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class LoginComponent {
//   email: string = '';
//   password: string = '';

//   constructor(private auth: AuthService, private router: Router, private db: AngularFireDatabase) { }

//   hide = signal(true);

//   clickEvent(event: MouseEvent) {
//     this.hide.set(!this.hide());
//     event.stopPropagation();
//   }

//   onSubmit(): void {
//     this.auth.signInWithEmailAndPassword(this.email, this.password)
//       .then((userCredential) => {
//         const userId = userCredential.user?.uid;

//         if (userId) {
//           this.db.database.ref('users/' + userId).once('value')
//             .then((snapshot) => {
//               if (snapshot.exists()) {
//                 const userData = snapshot.val();
//                 const role = userData.role;
//                 const username = userData.firstName + ' ' + userData.lastName;


//                 console.log("Connexion réussie, rôle :", role);
//                 localStorage.setItem('userRole', role);
//                 localStorage.setItem('username', username);
//                 localStorage.setItem('userData', JSON.stringify(userData));




//                 // 🔁 Fonction utilitaire pour charger des données supplémentaires
//                 const loadAdditionalData = (collection: string, storageKey: string, redirectPath: string) => {
//                   this.db.database.ref(collection)
//                     .orderByChild('utilisateurId')
//                     .equalTo(userId)
//                     .once('value')
//                     .then((snapshot) => {
//                       if (snapshot.exists()) {
//                         const dataObj = snapshot.val();
//                         const key = Object.keys(dataObj)[0];
//                         const extraData = dataObj[key];
//                         const fullUserData = {
//                           ...userData,
//                           ...extraData,
//                         };
//                         console.log(`Données supplémentaires ${collection}:`, fullUserData);
//                         localStorage.setItem(storageKey, JSON.stringify(fullUserData));
//                       } else {
//                         console.log(`Aucune donnée trouvée pour ${collection}`);
//                       }
//                       this.router.navigate([redirectPath]);
//                     })
//                     .catch((error) => {
//                       console.error(`Erreur lors de la récupération des données de ${collection} :`, error);
//                       this.router.navigate([redirectPath]);
//                     });
//                 };


//                 // 📦 Redirection et récupération en fonction du rôle
//                 switch (role) {
//                   case 'Patient':
//                     loadAdditionalData('patients', 'patientData', '/dashboardPatient');
//                     this.db.database.ref('dossier')
//                       .orderByChild('patientId')
//                       .equalTo(userId)
//                       .once('value')
//                       .then((dossierSnapshot) => {
//                         if (dossierSnapshot.exists()) {
//                           const dossiers = dossierSnapshot.val();
//                           const dossierKeys = Object.keys(dossiers);

//                           const allFichesPromises = dossierKeys.map(dossierKey => {
//                             return this.db.database.ref('fichesSoin')
//                               .orderByChild('dossierId') // ou dossierId selon ta base (⚠ vérifie)
//                               .equalTo(dossierKey)
//                               .once('value');
//                           });

//                           Promise.all(allFichesPromises).then(fichesSnapshots => {
//                             const ficheIds: string[] = [];

//                             // 📌 Stocke les IDs des fiches
//                             const ficheIdByDossier: Record<string, string[]> = {};

//                             fichesSnapshots.forEach(snapshot => {
//                               if (snapshot.exists()) {
//                                 const fiches = snapshot.val();
//                                 Object.keys(fiches).forEach(ficheId => {
//                                   ficheIds.push(ficheId);
//                                 });
//                               }
//                             });

//                             // 🔍 Maintenant on récupère toutes les lignes
//                             this.db.database.ref('lignesFicheSoin')
//                               .once('value')
//                               .then(lignesSnapshot => {
//                                 if (lignesSnapshot.exists()) {
//                                   const lignes = lignesSnapshot.val();

//                                   // 🗃 Organiser les lignes par fiche
//                                   const lignesParFiche: Record<string, any[]> = {};

//                                   Object.entries(lignes).forEach(([_, ligneData]: any) => {
//                                     const ficheId = ligneData.ficheSoinId;
//                                     if (ficheIds.includes(ficheId)) {
//                                       if (!lignesParFiche[ficheId]) {
//                                         lignesParFiche[ficheId] = [];
//                                       }
//                                       lignesParFiche[ficheId].push(ligneData);
//                                     }
//                                   });

//                                   console.log("✅ Lignes classées par fiche :", lignesParFiche);
//                                   localStorage.setItem('lignesFicheSoin', JSON.stringify(lignesParFiche));
//                                 } else {
//                                   console.warn("❌ Aucune ligne de fiche de soin trouvée.");
//                                 }
//                               });
//                           });
//                         } else {
//                           console.warn("❌ Aucun dossier trouvé pour ce patient.");
//                         }
//                       });

//                     break;
//                   case 'Medecin':
//                     loadAdditionalData('medecins', 'medecinData', '/dashboard');
//                     break;
//                   case 'Analyste':
//                     loadAdditionalData('analystes', 'analysteData', '/dashboard');
//                     break;
//                   case 'Radiologue':
//                     loadAdditionalData('radiologues', 'radiologueData', '/dashboard');
//                     break;
//                   default:
//                     this.router.navigate(['/']);
//                 }

//               } else {
//                 console.error("Aucune donnée utilisateur trouvée.");
//                 this.router.navigate(['/']);
//               }
//             })
//             .catch((error) => {
//               console.error("Erreur lors de la récupération des données utilisateur :", error);
//             });
//         }
//       })
//       .catch((error) => {
//         console.error("Erreur de connexion :", error);
//       });
//   }
// }

//-----------------------------------------------------------------
import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthService } from 'src/Services/auth-service.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hide = signal(true);
  loginError: string = ''; // 🔴 Nouveau champ pour afficher une erreur

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(): void {
    this.loginError = '';
    this.auth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        const userId = userCredential.user?.uid;
        if (!userId) {
          this.loginError = "Identifiant utilisateur manquant.";
          console.error(this.loginError);
          return;
        }

        localStorage.setItem('userUid', userId);
        console.log('Connexion utilisateur avec UID :', userId);

        this.db.database.ref('users/' + userId).once('value')
          .then((snapshot) => {
            if (!snapshot.exists()) {
              this.loginError = "Utilisateur introuvable dans la base.";
              console.error(this.loginError);
              this.router.navigate(['/login']);
              return;
            }

            const userData = snapshot.val();
            const role = userData.role;
            const username = `${userData.firstName} ${userData.lastName}`;

            console.log('Rôle détecté :', role);
            localStorage.setItem('userRole', role);
            localStorage.setItem('username', username);
            localStorage.setItem('userData', JSON.stringify(userData));

            // Fonction utilitaire pour charger les données selon rôle
            const loadAdditionalData = (
              collection: string,
              storageKey: string,
              redirectPath: string
            ) => {
              this.db.database.ref(collection)
                .orderByChild('utilisateurId')
                .equalTo(userId)
                .once('value')
                .then((snap) => {
                  if (snap.exists()) {
                    const obj = snap.val();
                    const key = Object.keys(obj)[0];
                    const extraData = obj[key];

                    const fullUserData = {
                      ...userData,
                      ...extraData,
                    };

                    console.log(`✅ Données récupérées depuis ${collection}`, fullUserData);
                    localStorage.setItem(storageKey, JSON.stringify(fullUserData));
                  } else {
                    console.warn(`⚠️ Aucune donnée dans ${collection}`);
                  }

                  this.router.navigate([redirectPath]);
                })
                .catch((error) => {
                  console.error(`Erreur ${collection} :`, error);
                  this.router.navigate([redirectPath]);
                });
            };

            // Redirection en fonction du rôle
            switch (role) {
              case 'Patient':
              case 'patient':
                loadAdditionalData('patients', 'patientData', '/dashboardPatient');
                this.db.database.ref('dossier')
                      .orderByChild('patientId')
                      .equalTo(userId)
                      .once('value')
                      .then((dossierSnapshot) => {
                        if (dossierSnapshot.exists()) {
                          const dossiers = dossierSnapshot.val();
                          const dossierKeys = Object.keys(dossiers);

                          const allFichesPromises = dossierKeys.map(dossierKey => {
                            return this.db.database.ref('fichesSoin')
                              .orderByChild('dossierId') // ou dossierId selon ta base (⚠ vérifie)
                              .equalTo(dossierKey)
                              .once('value');
                          });

                          Promise.all(allFichesPromises).then(fichesSnapshots => {
                            const ficheIds: string[] = [];

                            // 📌 Stocke les IDs des fiches
                            const ficheIdByDossier: Record<string, string[]> = {};

                            fichesSnapshots.forEach(snapshot => {
                              if (snapshot.exists()) {
                                const fiches = snapshot.val();
                                Object.keys(fiches).forEach(ficheId => {
                                  ficheIds.push(ficheId);
                                });
                              }
                            });

                            // 🔍 Maintenant on récupère toutes les lignes
                            this.db.database.ref('lignesFicheSoin')
                              .once('value')
                              .then(lignesSnapshot => {
                                if (lignesSnapshot.exists()) {
                                  const lignes = lignesSnapshot.val();

                                  // 🗃 Organiser les lignes par fiche
                                  const lignesParFiche: Record<string, any[]> = {};

                                  Object.entries(lignes).forEach(([_, ligneData]: any) => {
                                    const ficheId = ligneData.ficheSoinId;
                                    if (ficheIds.includes(ficheId)) {
                                      if (!lignesParFiche[ficheId]) {
                                        lignesParFiche[ficheId] = [];
                                      }
                                      lignesParFiche[ficheId].push(ligneData);
                                    }
                                  });

                                  console.log("✅ Lignes classées par fiche :", lignesParFiche);
                                  localStorage.setItem('lignesFicheSoin', JSON.stringify(lignesParFiche));
                                } else {
                                  console.warn("❌ Aucune ligne de fiche de soin trouvée.");
                                }
                              });
                          });
                        } else {
                          console.warn("❌ Aucun dossier trouvé pour ce patient.");
                        }
                      });
                break;
              case 'Medecin':
              case 'medecin':
                loadAdditionalData('medecins', 'medecinData', '/dashboard');
                break;
              case 'Analyste':
              case 'analyste':
                loadAdditionalData('analystes', 'analysteData', '/dashboard');
                break;
              case 'Radiologue':
              case 'radiologue':
                loadAdditionalData('radiologues', 'radiologueData', '/dashboard');
                break;
              default:
                this.loginError = "Rôle non reconnu.";
                console.error(this.loginError);
                this.router.navigate(['/']);
            }
          })
          .catch((error) => {
            this.loginError = "Erreur lors de la récupération des infos.";
            console.error(error);
            this.router.navigate(['/']);
          });
      })
      .catch((error) => {
        this.loginError = "Email ou mot de passe incorrect.";
        console.error("Erreur de connexion :", error);
      });
  }
}
