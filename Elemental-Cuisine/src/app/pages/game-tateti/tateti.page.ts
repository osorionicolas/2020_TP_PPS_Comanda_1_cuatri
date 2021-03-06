import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/classes/user';
import { CurrentAttentionService } from 'src/app/services/currentAttention.service';
import { Router } from '@angular/router';
import { Attention } from 'src/app/classes/attention';

@Component({
  selector: 'app-tateti',
  templateUrl: './tateti.page.html',
  styleUrls: ['./tateti.page.scss'],
})
export class TatetiPage implements OnInit {

  PLAYER_COMPUTER;
  PLAYER_HUMAN;
  DRAW;
  currentPlayer;

  board: any[];
  gameOver: boolean;
  boardLocked: boolean;

  constructor(
    private authService: AuthService,
    private userService: UserService,    
    private currentAttentionService: CurrentAttentionService,
    private router: Router) { }

  ngOnInit() {
    this.userService.getUserById(this.authService.getCurrentUser().uid).then(user => { 
      let nombre = (user.data() as User).name
      this.PLAYER_COMPUTER = { name: 'La Máquina', symbol: 'o' };
      this.PLAYER_HUMAN = { name: nombre, symbol: 'x' };
      this.DRAW = { name: 'Empate' };
      this.currentPlayer = this.PLAYER_HUMAN;
  
      this.newGame();
    })
  }

  square_click(square) {
    if (square.value === '' && !this.gameOver) {
      square.value = this.PLAYER_HUMAN.symbol;
      this.completeMove(this.PLAYER_HUMAN);
    }
  }

  computerMove(firstMove: boolean = false) {
    this.boardLocked = true;

    setTimeout(() => {
      let square = firstMove ? this.board[4] : this.getRandomAvailableSquare();
      square.value = this.PLAYER_COMPUTER.symbol;
      this.completeMove(this.PLAYER_COMPUTER);
      this.boardLocked = false;
    }, 600);
  }

  completeMove(player) {
    if (this.isWinner(player.symbol))
      this.showGameOver(player);
    else if (!this.availableSquaresExist())
      this.showGameOver(this.DRAW);
    else {
      this.currentPlayer = (this.currentPlayer == this.PLAYER_COMPUTER ? this.PLAYER_HUMAN : this.PLAYER_COMPUTER);

      if (this.currentPlayer == this.PLAYER_COMPUTER)
        this.computerMove();
    }
  }

  availableSquaresExist(): boolean {
    return this.board.filter(s => s.value == '').length > 0;
  }

  getRandomAvailableSquare(): any {
    let availableSquares = this.board.filter(s => s.value === '');
    var squareIndex = this.getRndInteger(0, availableSquares.length - 1);

    return availableSquares[squareIndex];
  }

  showGameOver(winner) {
    this.gameOver = true;

    if (winner !== this.DRAW) {
      this.currentPlayer = winner;
      if (winner.symbol == "x") {
        this.gameWon();
      } else {
        Swal.fire({
          title: '¡Qué lástima!',
          text: 'Perdiste, intentalo de vuelta!',
          type: 'error',
          padding: '3em',
          backdrop: false
        });
      }
    }
    else {
      Swal.fire({
        title: '¡Empataste!',
        text: 'Está peleado, intentalo de vuelta!',
        type: 'info',
        padding: '3em',
        backdrop: false
      });
    }
  }

  get winningIndexes(): any[] {
    return [
      [0, 1, 2],  //top row
      [3, 4, 5],  //middle row
      [6, 7, 8],  //bottom row
      [0, 3, 6],  //first col
      [1, 4, 7],  //second col
      [2, 5, 8],  //third col
      [0, 4, 8],  //first diagonal
      [2, 4, 6]   //second diagonal
    ];
  }

  isWinner(symbol): boolean {
    for (let pattern of this.winningIndexes) {
      const foundWinner = this.board[pattern[0]].value == symbol
        && this.board[pattern[1]].value == symbol
        && this.board[pattern[2]].value == symbol;

      if (foundWinner) {
        for (let index of pattern) {
          this.board[index].winner = true;
        }
        return true;
      }
    }
    return false;
  }

  newGame() {
    this.board = [
      { value: '' }, { value: '' }, { value: '' },
      { value: '' }, { value: '' }, { value: '' },
      { value: '' }, { value: '' }, { value: '' }
    ];

    this.gameOver = false;
    this.boardLocked = false;

    if (this.currentPlayer == this.PLAYER_COMPUTER) {
      this.boardLocked = true;
      this.computerMove(true);
    }
  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gameWon() {
    var userId = this.authService.getCurrentUser().uid;
    this.currentAttentionService.getAttentionById(userId).then(resp => {
      let attention = resp.data() as Attention;

      let message = "Pudiste vencer en el TaTeTi de nuevo!";

      if (!attention.freeDessert) {
        message = 'Pudiste vencer en el TaTeTi y ganaste un postre gratis!';
        attention.freeDessert = true;
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
