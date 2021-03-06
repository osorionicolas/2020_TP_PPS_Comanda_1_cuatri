import { Component, OnInit } from '@angular/core';
import { SmartAudioService } from 'src/app/services/smart-audio.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CurrentAttentionService } from 'src/app/services/currentAttention.service';
import { Attention } from 'src/app/classes/attention';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-simon',
  templateUrl: './simon.page.html',
  styleUrls: ['./simon.page.scss'],
})
export class SimonPage implements OnInit {

  private colours: Array<string> = ["green", "red", "yellow", "blue"];
  private userColours: Array<string> = new Array<string>();
  private machineColours: Array<string> = new Array<string>();
  private level: number = 1;
  private maxLevel: number = 3
  private levelJson: object = JSON.parse('{ "rounds":[{ "level":"1", "steps":"3", "speed":"700" }, { "level":"2", "steps":"2", "speed":"650" }, {"level":"3", "steps":"2", "speed":"600" }] }');
  private rounds: object = this.levelJson["rounds"];
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private speed: number = 800;
  private sounds = ['simon1', 'simon2', 'simon3', 'simon4'];
  private start = false;

  constructor(
    private smartAudioService: SmartAudioService,
    private currentAttentionService: CurrentAttentionService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() { }

  startGame() {
    this.start = true
    document.body.setAttribute("style", "pointer-events: none");
    this.clearVariables();
    let stepsCount: number = this.rounds[Object.keys(this.rounds).find(i => this.rounds[i].level === this.level.toString())].steps;
    this.fillMachineColours(stepsCount);
    console.log(this.machineColours);
    this.showSteps();
    this.isPlaying = true;
  }

  validate(event) {
    let self = this;
    if (this.isPlaying) {
      this.smartAudioService.play(this.sounds[this.colours.indexOf(event.currentTarget.getAttribute("colour"))]);
      this.userColours.push(event.currentTarget.getAttribute("colour"));
      if (this.userColours[this.currentStep] == this.machineColours[this.currentStep]) {
        this.currentStep++;
      }
      else {
        Swal.fire({
          title: '¡Qué lástima!',
          text: 'Perdiste contra Simón, intentalo de vuelta!',
          type: 'error',
          padding: '3em',
          backdrop: false
        }).then(() => {
          self.restartGame();
        });
        return;
      }

      if (this.userColours.length === this.machineColours.length)
        self.winGame();
    }
  }

  winGame() {
    let self = this;
    if (this.level === this.maxLevel) {
      this.gameWon();
    }
    else {
      this.isPlaying = false;
      this.level++;
      setTimeout(function () {
        self.startGame();
      }, 1000);
    }
  }

  restartGame() {
    this.machineColours = [];
    this.isPlaying = false;
    this.level = 1;
    this.speed = 800;
    this.start = false;
  }

  clearVariables() {
    this.userColours = [];
    this.currentStep = 0;
  }

  fillMachineColours(steps) {
    for (let x: number = 0; x < steps; x++) {
      let randomValue = this.colours[Math.floor(Math.random() * this.colours.length)];
      this.machineColours.push(randomValue);
    }
  }

  showSteps() {
    let self = this;
    if (self.currentStep > self.machineColours.length - 1) {
      self.currentStep = 0;
      document.body.removeAttribute("style");
      return;
    }
    var colour = self.machineColours[self.currentStep];
    setTimeout(function () {
      let pads = document.getElementsByClassName("pad");
      for (let pad of pads) {
        if (pad.getAttribute("colour") == colour) {
          pad.classList.add("active");
          self.smartAudioService.play(self.sounds[self.colours.indexOf(colour)]);
        }
      }
    }, 300);
    setTimeout(function () {
      let pads = document.querySelectorAll(".pad");
      for (let pad of pads) {
        if (pad.getAttribute("colour") == colour) {
          pad.classList.remove("active");
        }
      }
      self.currentStep++;
      self.speed = self.rounds[Object.keys(self.rounds).find(i => self.rounds[i].level === self.level.toString())].speed;
      self.showSteps();
    }, self.speed);
  }

  gameWon() {
    var userId = this.authService.getCurrentUser().uid;
    this.currentAttentionService.getAttentionById(userId).then(resp => {
      let attention = resp.data() as Attention;

      let message = "Pudiste vencer a Simón de nuevo!";

      if (!attention.freeDrink) {
        message = 'Pudiste vencer a Simón y ganaste una bebida gratis!';
        attention.freeDrink = true;
        this.currentAttentionService.modifyAttention(userId, attention);
      }

      Swal.fire({
        title: '¡Felicitaciones!',
        text: message,
        type: 'success',
        padding: '3em',
        backdrop: false
      }).then(() => {
        this.router.navigateByUrl('/juegos');
      });
    });
  }
}