import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
export class User {
  userCredential: {};
  errorMessage: string;
  registered: boolean;
  logged: boolean;
  displayName: string;
  email: string;
  photoURL: string;
  emailVerified: boolean;
  uid: string;
}

@Injectable()
export class LoginService {
  poisTraidos: any[];
  tabla = 'users/';
  constructor(
    public angularfirebaseDB: AngularFireDatabase,
    public toastCtrl: ToastController,
    public firebaseAuth: AngularFireAuth
  ) {}

  public login(aUser) {
    let user = new User();
    return new Promise<User>((resPromesa) => {
      debugger;
      console.log(aUser);
      this.firebaseAuth.auth
        .signInWithEmailAndPassword(aUser.email, aUser.password)
        .then((userCredential) => {
          //EXITO
          debugger;
          user.logged = true;
          user.userCredential = userCredential;
          user.email = userCredential.user.email;
          user.emailVerified = userCredential.user.emailVerified;
          user.uid = userCredential.user.uid;
          resPromesa(user);
        })
        .catch(function (error) {
          debugger;
          var errorCode = error.code;
          user.logged = false;
          switch (errorCode) {
            case 'auth/wrong-password': {
              user.errorMessage = 'La constraseña o el email no coinciden.';
              break;
            }
            case 'auth/user-not-found': {
              user.errorMessage =
                'El usuario no existe. Por favore regístrese.';
              break;
            }
          }
          resPromesa(user);
        });
    });
  }
  public register(aUser) {
    let user = new User();
    return new Promise<User>((resPromesa) => {
      this.firebaseAuth.auth
        .createUserWithEmailAndPassword(aUser.email, aUser.password)
        .then((userCredential) => {
          //EXITO
          user.registered = true;
          user.logged = true;
          user.userCredential = userCredential;
          //user.displayName = userCredential.user.displayName;
          user.email = userCredential.user.email;
          user.emailVerified = userCredential.user.emailVerified;
          //user.photoURL = userCredential.user.photoURL;
          user.uid = userCredential.user.uid;
          resPromesa(user);
        })
        .catch(function (error) {
          //ERRORES
          var errorCode = error.code;
          user.registered = false;
          switch (errorCode) {
            case 'auth/weak-password': {
              user.errorMessage = 'La constraseña es muy débil.';
              break;
            }
          }
          resPromesa(user);
        });
    });
  }
  public logout() {
    let user = new User();
    return new Promise<User>((resPromesa) => {
      this.firebaseAuth.auth
        .signOut()
        .then(function () {
          user.logged = false;
          user.errorMessage = '';
          resPromesa(user);
        })
        .catch(function (error) {
          //ERRORES
          user.logged = true;
          user.errorMessage = 'Error al cerrar la sesion';
          resPromesa(user);
        });
    });
  }

  public estadoDelUsuario() {
    let userRegisteredOrLogged = new User();
    debugger;
    //let usuarioActual = aUser.userCredential.user;
    return new Promise<User>((resPromesa) => {
      this.firebaseAuth.auth.onAuthStateChanged(function (user) {
        debugger;
        if (user) {
          // User is signed in.
          debugger;
          userRegisteredOrLogged.logged = true;
          userRegisteredOrLogged.errorMessage = '';
          userRegisteredOrLogged.email = user.email;
          userRegisteredOrLogged.emailVerified = user.emailVerified;
          userRegisteredOrLogged.uid = user.uid;
          resPromesa(userRegisteredOrLogged);
        } else {
          // No user is signed in.
          userRegisteredOrLogged.logged = false;
          //userRegisteredOrLogged.registered = false;
          resPromesa(userRegisteredOrLogged);
        }
      });
    });
  }
}
