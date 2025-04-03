import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService} from 'src/Services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private Auth:AuthService,private router:Router){}
  email: string='';
  password: string='';
  onSubmit():void{
    console.log(this.email);
    console.log(this.password);

    this.Auth.signInWithEmailAndPassword(this.email, this.password).then(()=>{
      console.log("connexion faite avec success");
      this.router.navigate(['']);
    });

  }

}