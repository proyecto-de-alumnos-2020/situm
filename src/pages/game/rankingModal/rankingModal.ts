import { Component } from "@angular/core";
import {
  Platform,
  ViewController,
  NavParams,
  AlertController
} from "ionic-angular";
import { GameService, Score } from "../../../services/game.service";
import { Workspace } from "../../../services/workspace.service";

@Component({
  selector: "page-rankingModal",
  templateUrl: "rankingModal.html"
})
export class RankingModal {
  scores: Score[];

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private gameService: GameService,
    public alertCtrl: AlertController,
    public navParams: NavParams
  ) {
    this.gameService.getScoresForWorkspace(this.workspace).subscribe(values => {
      this.scores = values;
      console.log(values);
    });
  }

  private close() {
    this.viewCtrl.dismiss();
  }

  getImgSrc(index: number) {
    switch (index) {
      case 0:
        return "assets/img/trophy_1.png";
      case 1:
        return "assets/img/trophy_2.png";
      case 2:
        return "assets/img/trophy_3.png";
      default:
        return "assets/img/reward.png";
    }
  }

  get workspace(): Workspace {
    return this.navParams.get("workspace");
  }
}
