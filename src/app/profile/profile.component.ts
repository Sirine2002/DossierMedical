import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { AuthService } from 'src/Services/auth-service.service';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  isDataChanged = false;

  username: string | null = localStorage.getItem('username');
  userrole: string | null = localStorage.getItem('userRole');
  profileData: any = {};
  password: string = '';
  confirmPassword: string = '';

  @ViewChild('changePasswordDialog') changePasswordDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private clipboard: Clipboard,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('userUid');
    const role = this.userrole?.toLowerCase();
    console.log('userUid:', uid);
    console.log('userRole:', role);

    if (uid && role) {
      this.db.object(`users/${uid}`).valueChanges().pipe(take(1)).subscribe((userData: any) => {
        this.db.object(`${role}s/${uid}`).valueChanges().pipe(take(1)).subscribe((roleData: any) => {

          console.log('userData:', userData);
          console.log('roleData:', roleData);

          if (!userData) {
            console.log('Données manquantes.');
            return;
          }

          this.profileData = { ...userData, ...roleData };

          this.profileForm = this.fb.group({
            cin: [this.profileData?.cin || ''],
            firstName: [this.profileData?.firstName || ''],
            lastName: [this.profileData?.lastName || ''],
            dateNaissance: [this.profileData?.dateNaissance || ''],
            sexe: [this.profileData?.sexe || ''],
            phone: [this.profileData?.phone || ''],
            email: [this.profileData?.email || ''],
            adresse: [this.profileData?.adresse || ''],
            type: [this.profileData?.typeImagerie || ''],
            service: [this.profileData?.service || ''],
            specialite: [this.profileData?.specialite || ''],
          });

          // Désactivation des champs selon rôle
          if (role === 'Patient') {
            this.profileForm.get('dateNaissance')?.disable();
            this.profileForm.get('sexe')?.disable();
          }
          if (role !== 'Patient') {
            this.profileForm.get('adresse')?.disable();
          }
          this.profileForm.get('email')?.disable();
          if (role === 'Medecin') {
            this.profileForm.get('specialite')?.disable();
          }

          this.profileForm.valueChanges.subscribe(() => {
            this.isDataChanged = true;
          });
        });
      });
    }
  }


  initForm(): void {
    this.profileForm = this.fb.group({
      cin: [this.profileData?.cin || ''],
      firstName: [this.profileData?.firstName || ''],
      lastName: [this.profileData?.lastName || ''],
      dateNaissance: [this.profileData?.dateNaissance || ''],
      sexe: [this.profileData?.sexe || ''],
      phone: [this.profileData?.phone || ''],
      email: [this.profileData?.email || ''],
      adresse: [this.profileData?.adresse || ''],
      type: [this.profileData?.typeImagerie || ''],
      service: [this.profileData?.service || ''],
      specialite: [this.profileData?.specialite || ''],
    });

    // Désactiver certains champs selon rôle
    if (this.userrole === 'Patient') {
      this.profileForm.get('dateNaissance')?.disable();
      this.profileForm.get('sexe')?.disable();
    }
    if (this.userrole !== 'Patient') {
      this.profileForm.get('adresse')?.disable();
    }
    this.profileForm.get('email')?.disable();
    if (this.userrole === 'Medecin') {
      this.profileForm.get('specialite')?.disable();
    }

    // Détecter les modifications
    this.profileForm.valueChanges.subscribe(() => {
      this.isDataChanged = true;
    });
  }

  save(): void {
    if (this.profileForm.valid) {
      const updatedData = { ...this.profileData, ...this.profileForm.getRawValue() };
      const uid = localStorage.getItem('userUid');
      const role = this.userrole;

      if (uid && role) {
        const userCommonData = {
          cin: updatedData.cin,
          email: updatedData.email,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          phone: updatedData.phone,
          role: role,
        };

        let roleSpecificData: any = { utilisateurId: uid };

        switch (role) {
          case 'Patient':
            roleSpecificData = {
              ...roleSpecificData,
              adresse: updatedData.adresse,
              dateNaissance: updatedData.dateNaissance,
              sexe: updatedData.sexe,
            };
            break;

          case 'Medecin':
            roleSpecificData = {
              ...roleSpecificData,
              specialite: updatedData.specialite,
            };
            break;

          case 'Radiologue':
            roleSpecificData = {
              ...roleSpecificData,
              service: updatedData.service,
              typeImagerie: updatedData.type,
            };
            break;

          case 'Analyste':
            roleSpecificData = {
              ...roleSpecificData,
              service: updatedData.service,
              specialite: updatedData.specialite,
            };
            break;
        }

        // Mise à jour Firebase
        this.db.object(`users/${uid}`).set(userCommonData)
          .then(() => console.log('Données utilisateur mises à jour.'))
          .catch(error => console.error('Erreur mise à jour utilisateur :', error));

        this.db.object(`${role.toLowerCase()}s/${uid}`).set(roleSpecificData)
          .then(() => console.log(`Données ${role} mises à jour.`))
          .catch(error => console.error(`Erreur mise à jour ${role} :`, error));

        // Mise à jour du localStorage
        const storageKey = `${role}Data`;
        localStorage.setItem(storageKey, JSON.stringify(updatedData));

        // Rafraîchir formulaire
        this.profileData = updatedData;
        this.profileForm.patchValue(updatedData);

        this.isDataChanged = false;
      }
    }
  }

  cancel(): void {
    if (this.profileData) {
      this.profileForm.patchValue(this.profileData);
      this.isDataChanged = false;
    }if(this.userrole === 'Patient') {
      this.router.navigate(['/dashboardPatient']);
    }
    else {
      this.router.navigate(['/dashboard']);
    }
  }
}
