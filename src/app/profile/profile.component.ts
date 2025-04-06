import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { AuthService } from 'src/Services/auth-service.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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
    private location: Location
  ) {}

  ngOnInit(): void {
     // Assurez-vous que le rôle est stocké dans localStorage

    if (this.userrole) {
      // Construire la clé dynamique en fonction du rôle
      const storageKey = `${this.userrole.toLowerCase()}Data`; // Par exemple, 'patientData', 'medecinData', etc.
      const storedUserData = localStorage.getItem(storageKey); 
  
      console.log(`${storageKey}:`, storedUserData);

    if (storedUserData) {
      this.profileData = JSON.parse(storedUserData);
    }

    this.profileForm = this.fb.group({
      cin: [this.profileData?.cin || ''],
      prenom: [this.profileData?.firstName || ''],
      nom: [this.profileData?.lastName || ''],
      birthDate: [this.profileData?.dateNaissance || ''],
      sexe: [this.profileData?.sexe || ''],
      phone: [this.profileData?.phone || ''],
      email: [this.profileData?.email || ''],
      address: [this.profileData?.adresse || ''],
      type: [this.profileData?.typeImagerie || ''],
      service: [this.profileData?.service || ''],
      specialite: [this.profileData?.specialite || ''],
    });

    this.profileForm.valueChanges.subscribe(() => {
      this.isDataChanged = true;
    });
  }}

  save(): void {
    if (this.profileForm.valid) {
      const updatedData = { ...this.profileData, ...this.profileForm.value };
      localStorage.setItem('NewuserData', JSON.stringify(updatedData));
      this.profileData = updatedData;
      this.isDataChanged = false;
      console.log('Profile saved:', updatedData);
    }
  }
  NewuserData=localStorage.getItem('NewuserData');
  

  cancel(): void {
    this.profileForm.patchValue({
      cin: this.profileData.cin,
      prenom: this.profileData.prenom,
      nom: this.profileData.nom,
      birthDate: this.profileData.birthDate,
      sexe: this.profileData.sexe,
      phone: this.profileData.phone,
      email: this.profileData.email,
      address: this.profileData.address,
    });
    this.isDataChanged = false;
    this.location.back();
  }





  
}
