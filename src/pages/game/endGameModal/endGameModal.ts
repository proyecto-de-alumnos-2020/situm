import { Component } from "@angular/core";
import {
  Platform,
  ViewController,
  NavParams,
  AlertController
} from "ionic-angular";
import { GameService } from "../../../services/game.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { User } from "../../../services/login.service";
import { environment } from "../../../env/environment";

@Component({
  selector: "page-endGameModal",
  templateUrl: "endGameModal.html"
})
export class EndGameModal {
  form: FormGroup;

  user: User;

  isLoading = false;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private gameService: GameService,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      code: ["", Validators.required]
    });

    this.user = this.navParams.get("user");
  }

  onSubmit() {
    if (this.formValue === this.code) {
      this.isLoading = true;
      this.gameService
        .saveScore(this.user)
        .then(value => {
          this.isLoading = false;

          this.dismiss();

          if (value) {
            return this.alertText(
              "Felicitaciones",
              "Tus resultados se han guardado correctamente."
            );
          }
        })
        .catch(() => {
          this.isLoading = false;
          this.alertText(
            "Lo siento",
            "Ocurrió un error al guardar tus resultados."
          );
        });
    } else {
      this.form.get("code").setErrors({ invalid: true });
    }
  }

  private dismiss() {
    this.viewCtrl.dismiss();
  }

  private alertText(aTitle, aSubTitle) {
    let alert = this.alertCtrl.create({
      title: aTitle,
      subTitle: aSubTitle,
      buttons: ["Cerrar"]
    });
    alert.present();
  }

  get formValue(): string {
    return this.form.get("code").value;
  }

  get code(): string {
    return environment.endCode;
  }

  get points(): number {
    return this.gameService.score;
  }

  get time(): number {
    return this.gameService.time;
  }
}
