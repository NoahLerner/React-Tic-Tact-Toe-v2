import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


// Square is a function component
// useful when the component just needs to render something
function Square(props){
  return (
    <button
      className={ "square " + (props.isWinner ? 'winning-square' : '') }
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}
  
class Board extends React.Component {
  renderSquare(i) {
    return <Square 
      isWinner={
        this.props.winningSquares && this.props.winningSquares.includes(i) ? true : false
      }
      value={this.props.squares[i]}
      onClick={
        () => this.props.onClick(i)
      }
    />;
  }

  render() {

    const squares = Array(9).fill(null);
    for (let i = 0; i < 9; i++) {
      squares[i] = this.renderSquare(i);
    }

    const boardRows = Array(3).fill(null);
    for (let i = 0; i < 3; i++) {
      let group = i * 3;
      boardRows[i] = (
        <div className="board-row">
          {squares.slice(group, group + 3)}
        </div>
      );
    }

    return (
      <div>{boardRows}</div>
    );
  }
}
  
class Game extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: null,
        player: null,
      }],
      isXNext: true,
      stepNumber: 0,
      order: 'asc',
    }
  }

  handleClick(i){
    
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // if there is already a winner, or the square is filled then ignore the click
    if(calculateWinner(squares) || squares[i]){
      return;
    }

    squares[i] = this.state.isXNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        location: i,
        player: squares[i],
      }]),
      isXNext: !this.state.isXNext,
      stepNumber: this.state.stepNumber + 1,
    });
  }

  jumpTo(step){
    const history = this.state.history.slice(0, step + 1);
    this.setState({
      stepNumber: step,
      isXNext: (step % 2) === 0,
      history: history,
    });
  }

  getHistoricalMoves(history){
    return history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      
      const location = move ?
        history[move].player + ' @ location: ' + getRow(history[move].location) + ', ' + getCol(history[move].location):
        '';

      // returns a list item with button
      return (
        <li key={move}>
          <button className="moveButton" onClick = {() => this.jumpTo(move)}>
            {desc}
          </button>
          <label>
            {"  " + location}
          </label>
        </li>
      );
    });
  }

  render() {

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winObj = calculateWinner(current.squares);
    const winner = winObj ? winObj.winner : null;
    const winningSquares = winObj ? winObj.winningSquares : null;

    const movesAsc = this.getHistoricalMoves(history);
    const moves = this.state.order == 'asc' ? movesAsc : movesAsc.slice().reverse(); 

    let status;
    if(winner){
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.isXNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winningSquares={winningSquares}
            onClick = {i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button 
            className="orderToggle"
            onClick={
              () => this.setState({
                order: this.state.order == 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {this.state.order}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          winningSquares: [a, b, c],
        }
      }
    }
    return null;
  }

  function getRow(i){

    const row1 = [0, 1, 2];
    const row2 = [3, 4, 5];
    //const row3 = [6, 7, 8];

    const row = row1.includes(i) ?
                  1:
                  (row2.includes(i) ? 
                    2:
                    3);
    return row;
  }

  function getCol(i){
    
    const col1 = [0, 3, 6];
    const col2 = [1, 4, 7];
    //const col3 = [2, 5, 8];

    const col = col1.includes(i) ?
                  1:
                  (col2.includes(i) ? 
                    2:
                    3);
    return col;
  }