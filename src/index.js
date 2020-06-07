import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.highlight ? "square highlight" : "square"} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)} highlight={this.props.toHighlight ? this.props.toHighlight.includes(i) : false} />
        );
    }

    render() {
        var board = [];
        for (let i = 0; i < 3; i++) {
            var row = [];
            for (let j = 0; j < 3; j++) {
                row.push(this.renderSquare(i * 3 + j));
            }
            board.push(<div className="board-row">{row}</div>);
        }

        return (
            <div>{board}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    location: null,
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            selectedMove: null,
            sort: false,
            draw: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    location: i,
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });

        if (squares.filter(square => !square).length === 0) {
            this.setState({ draw: true, });
            return;
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            selectedMove: step,
            draw: false,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        let moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + '(' + parseInt(step.location / 3) + ',' + step.location % 3 + ')' :
                'Go to game start';
            return (
                <li key={move}>
                    <button className={this.state.selectedMove === move ? 'bolder' : ''} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        if (this.state.sort)
            moves = moves.reverse();

        const winResult = calculateWinner(current.squares);
        let toHighlight;
        let status;
        if (winResult) {
            status = "Winner: " + winResult.winner;
            toHighlight = winResult.highlight;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        if (this.state.draw)
            status = 'DRAW';

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        toHighlight={toHighlight}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div><button onClick={() => this.setState({ sort: !this.state.sort })}>Sort Asc/Desc</button></div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { 'winner': squares[a], 'highlight': lines[i] };
        }
    }
    return null;
}
