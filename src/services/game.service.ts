import { Injectable } from '@angular/core';

// RXJS
import { map, takeUntil, tap, catchError } from 'rxjs/operators';
import { timer, BehaviorSubject, Subject, Observable, of } from 'rxjs';

// Models
import { Poi } from './pois.service';

import { orderBy, uniqBy } from 'lodash';

// Contants
import { environment } from '../env/environment';
import { AngularFireDatabase } from 'angularfire2/database';
import { Workspace } from './workspace.service';
import { User } from './login.service';
import { Storage } from '@ionic/storage';

const { points = 50 } = environment;

export interface Score {
  user: User;
  time: number;
  score: number;
}

@Injectable()
export class GameService {
  time = 0;
  score = 0;

  totalPoi: number;

  onGoing = false;

  tabla = 'scores/';

  private markedPoi = new BehaviorSubject([]);
  private unsubscribe = new Subject();

  private workspace: Workspace;

  private startDate: Date;

  private userId: string;

  constructor(
    public angularfirebaseDB: AngularFireDatabase,
    private storage: Storage
  ) {}

  public hasScore(workspace: Workspace, userId: string) {
    return this.angularfirebaseDB
      .object<Score>(`${this.tabla}/${workspace.idWorkspace}/${userId}`)
      .valueChanges()
      .pipe(catchError((e) => of(false)))
      .pipe(map((value) => (!!value ? true : false)));
  }

  public getScoresForWorkspace(workspace: Workspace): Observable<Score[]> {
    return this.angularfirebaseDB
      .list<Score>(`${this.tabla}/${workspace.idWorkspace}`)
      .valueChanges()
      .pipe(
        map((values) => orderBy(values, ['score', 'time'], ['desc', 'asc']))
      );
  }

  public saveScore(user: User) {
    const { time, score } = this;

    return new Promise<boolean>((resPromesa) => {
      this.angularfirebaseDB.database
        .ref(`${this.tabla}/${this.workspace.idWorkspace}/${user.uid}`)
        .set({ user, time, score })
        .then(
          (resolve) => {
            this.storage.remove(this.storeId);
            this.reset();
            resPromesa(true);
          },
          (reject) => {
            resPromesa(false);
          }
        );
    });
  }

  startGame = (totalPoi: number, workspace: Workspace, userId: string) => {
    if (!this.onGoing) {
      // this.reset();
      this.onGoing = true;
      this.totalPoi = totalPoi;
      this.userId = userId;
      this.setWorkspace(workspace);

      this.storage.get(this.storeId).then((obj) => {
        if (obj) {
          console.log('stored', obj);
          this.startDate = obj.startDate;

          const now = new Date();
          const seconds = (now.getTime() - obj.startDate.getTime()) / 1000;

          this.time = Math.round(seconds);

          const pois = obj.pois.filter(
            (e) => e.poi.workspaceId == this.workspaceId
          );

          this.markedPoi.next(uniqBy(pois, (e) => e.poi.identifier) || []);
          console.log('unique', uniqBy(pois, (e) => e.poi.identifier) || []);
        } else {
          this.startDate = new Date();
          this.storage
            .set(this.storeId, { startDate: this.startDate, pois: [] })
            .then(() => {
              this.time = 0;
            });
        }
      });
    }

    return this.startTimer();
  };

  setWorkspace(workspace: Workspace) {
    this.workspace = workspace;
  }

  endGame = () => {
    this.onGoing = false;
    this.unsubscribe.next();
  };

  startTimer() {
    return timer(0, 1000).pipe(
      map((_) => {
        const now = new Date();

        this.time = this.startDate
          ? Math.round((now.getTime() - this.startDate.getTime()) / 1000)
          : 0;

        return this.time;
      }),
      takeUntil(this.unsubscribe)
    );
  }

  getMarkedPois(): Observable<{ poi: Poi; response: string }[]> {
    return this.markedPoi.asObservable().pipe(takeUntil(this.unsubscribe));
  }

  answerQuestion = (poi: Poi, response: string): void => {
    console.log('savePOI', poi, response);

    let currentPois = this.markedPoi.getValue();

    // if (currentPois.find(c => c.poi.identifier == poi.identifier)) {
    //   return;
    // }

    // currentPois = uniqBy([...currentPois], e => {
    //   e.poi.identifier;
    // });
    // Mark poi as responded

    console.log('all current', currentPois);

    this.storage.set(this.storeId, {
      startDate: this.startDate,
      pois: [...currentPois, { poi, response }],
    });

    console.log('next', [...currentPois, { poi, response }]);
    this.markedPoi.next([...currentPois, { poi, response }]);

    // Increase points if response is correct
    if (response == poi.answer) {
      this.increaseScore();
    }

    // Have completed all pois
    // if (currentPois.length === this.totalPoi) {
    //   this.unsubscribe.next();
    // }
  };

  increaseScore(): void {
    this.score += points;
  }

  reset(): void {
    this.score = 0;
    this.time = 0;

    this.markedPoi.next([]);
  }

  get workspaceId() {
    return new String(this.workspace.idWorkspace) as string;
  }

  get storeId() {
    return `${this.workspaceId}-${this.userId}`;
  }
}

// scores.1571249719369.b39iRbu0Nwcrf7UucLEWTxwVahq1.user.userCredential.user.ja'
// Error: Reference.set failed: First argument contains undefined in property 'scores.1571249719369.b39iRbu0Nwcrf7UucLEWTxwVahq1.user.userCredential.u
