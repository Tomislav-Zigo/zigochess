class Piece{

    constructor(type, color, file, rank) {
        this.color = color;
        this.file = file;
        this.rank = rank;
        this.type = type;
    }

}

class Queen extends Piece{

constructor(color, file, rank) {
    super("q", color, file, rank);
    if(this.color == "white"){
        this.imagePath = "graphics/white_queen.png"
    }else{
        this.imagePath = "graphics/black_queen.png"
    }
}

}

class Rook extends Piece{

constructor(color, file, rank) {
    super("r", color, file, rank);

    if(this.color == "white"){
        this.imagePath = "graphics/white_rook.png"
    }else{
        this.imagePath = "graphics/black_rook.png"
    }
}

}

class King extends Piece{

constructor(color, file, rank) {
    super("k", color, file, rank);


    if(this.color == "white"){
        this.imagePath = "graphics/white_king.png"
    }else{
        this.imagePath = "graphics/black_king.png"
    }
}

}

class Pawn extends Piece{

constructor(color, file, rank) {
    super("p", color, file, rank);
    if(this.color == "white"){
        this.imagePath = "graphics/white_pawn.png"
    }else{
        this.imagePath = "graphics/black_pawn.png"
    }
}

}

class Bishop extends Piece{

constructor(color, file, rank) {
    super("b", color, file, rank);
    if(this.color == "white"){
        this.imagePath = "graphics/white_bishop.png"
    }else{
        this.imagePath = "graphics/black_bishop.png"
    }
}

}

class Knight extends Piece{

constructor(color, file, rank) {
    super("n", color, file, rank);    
    if(this.color == "white"){
        this.imagePath = "graphics/white_knight.png"
    }else{
        this.imagePath = "graphics/black_knight.png"
    }
}

}



const flip = document.querySelector("#flip")
const settings = document.querySelector("#settings")
const resign = document.querySelector("#resign")
const loadFENButton = document.querySelector("#load-fen")
const FENInput = document.querySelector("#fen-input")
const boardContainer = document.querySelector('.board-container')
const FENDisplay = document.querySelector("#fen-display")
let board;
let selectedSquare;
let whiteToMove = true;
let enPassantSquare = null;
let halfMoveClock = 0;
let fullMoveNumber = 0;
let alphabet = "abcdefgh"
let whiteCanCastleShort
let whiteCanCastleLong
let blackCanCastleShort
let blackCanCastleLong
let boardFacingWhite = true;
let squareSize = boardContainer.getBoundingClientRect().height/8;

let debug = false;

let blackKingSquare = {"file":4,"rank":7}
let whiteKingSquare = {"file":4,"rank":0}

loadFENButton.addEventListener('click', function(e) {
    e.preventDefault();
    var input = FENInput.value
    if(input.includes("k") && input.includes("K")){
        loadFEN(input)
        FENInput.value = "";
    }
})

FENInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        var input = FENInput.value
        if(input.includes("k") && input.includes("K")){
            loadFEN(input)
            FENInput.value = "";
        }

    }
})

resign.addEventListener("click", ()=>{
    if(whiteToMove){
        displayVictoryFor("black")
    }else{
        displayVictoryFor("white")
    }
})

flip.addEventListener("click", ()=>{
    flipBoard()
})

settings.addEventListener("click", ()=>{
    console.log("settings")
})

//event listener for clicking
boardContainer.addEventListener('click',(e)=>{

    var file;
    var rank;
        
    if(boardFacingWhite){
        file = Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = 7-Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }else{
        file = 7-Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }

if(board[file][rank] != null && selectedSquare == null){
    selectedSquare = {"file":file,"rank":rank};
}else if(selectedSquare!=null && (selectedSquare.file != file || selectedSquare.rank != rank)){
    attemptToMove(selectedSquare,{"file":file,"rank":rank})
    selectedSquare = null;
}

})

//eventlistener for start drag
boardContainer.addEventListener('dragstart',(e)=>{
    var file;
    var rank;
    
    if(boardFacingWhite){
        file = Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = 7-Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }else{
        file = 7-Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }

if(board[file][rank] != null){
    selectedSquare = {"file":file,"rank":rank};
}

if(board[file][rank] == null)return;



draggedPiece = document.getElementById(`${file.toString() + rank.toString()}`);
draggedPiece.classList.add("beingDragged")
setTimeout(()=>(draggedPiece.classList.add("invisible")),0)

//legalMovesFor({"file":file,"rank":rank}).forEach(move => {
//    boardContainer.innerHTML+=`<div class = "move-indicator" style = "bottom:${move.rank*62.5}px ; left:${move.file*62.5}px"</div>`
//})

})

//event listener for end drag
boardContainer.addEventListener('drop',(e)=>{
    var file;
    var rank;
    
    if(boardFacingWhite){    
        file = Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = 7-Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }else{
        file = 7-Math.floor((e.clientX - boardContainer.getBoundingClientRect().x)/squareSize);
        rank = Math.floor((e.clientY - boardContainer.getBoundingClientRect().y)/squareSize);
    }

if(selectedSquare == null)return;

draggedPiece = document.getElementById(`${selectedSquare.file.toString() + selectedSquare.rank.toString()}`);
draggedPiece.classList.remove("beingDragged","invisible")

attemptToMove(selectedSquare,{"file":file,"rank":rank})
selectedSquare = null;
})

boardContainer.ondragover = function(e){
e.preventDefault()
}

//trys to make a move on the game board
function attemptToMove(coord1,coord2){

    if(debug) console.log("attempting to move");

    if(isLegalMove(coord1,coord2)){
        executeMove(coord1,coord2)
    }

}

//executes a move on the game board both physcally and logically including special events like castling and en passant
function executeMove(coord1,coord2){ 

    if(debug) console.log("executing move(");
    
    toBeMoved = board[coord1.file][coord1.rank]
    targetSquare = {"file":coord2.file,"rank":coord2.rank}
    
    //promotion for white
    if(toBeMoved.type == "p" && toBeMoved.color == "white" && targetSquare.rank == 7){
        movePieceLogically(coord1,coord2);
        board[coord2.file][coord2.rank] = new Queen("white",coord2.file,coord2.rank);

    }
    //promotion for black
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && targetSquare.rank == 0){
        movePieceLogically(coord1,coord2);
        board[coord2.file][coord2.rank] = new Queen("black",coord2.file,coord2.rank);
    }


    //castle white short
    else if(toBeMoved.type == "k" && whiteCanCastleShort && sameSquare(targetSquare,{"file":6,"rank":0}) ){
        movePieceLogically(whiteKingSquare,{"file":6,"rank":0});
        movePieceLogically({"file":7,"rank":0} , {"file":5,"rank":0});
    }
    
    //castle white long
    else if(toBeMoved.type == "k" && whiteCanCastleLong && sameSquare(targetSquare,{"file":2,"rank":0})){
        movePieceLogically(whiteKingSquare,{"file":2,"rank":0});
        movePieceLogically({"file":0,"rank":0} , {"file":3,"rank":0});
    }
    
    //castle black short
    else if(toBeMoved.type == "k" && blackCanCastleShort && sameSquare(targetSquare,{"file":6,"rank":7})){
        movePieceLogically(blackKingSquare,{"file":6,"rank":7});
        movePieceLogically({"file":7,"rank":7} , {"file":5,"rank":7});
    }
    
    //castle black long
    else if(toBeMoved.type == "k" && blackCanCastleLong && sameSquare(targetSquare,{"file":2,"rank":7})){
        movePieceLogically(blackKingSquare,{"file":2,"rank":0});
        movePieceLogically({"file":0,"rank":7} , {"file":3,"rank":7});
    }
    
    //white making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "white" && enPassantSquare != null && sameSquare(coord2,enPassantSquare)){
        if(debug)console.log("en passant")
        
    
        //move pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        movePieceLogically( {"file":enPassantSquare.file,"rank":enPassantSquare.rank-1} , enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        movePieceLogically(coord1,coord2) 
    }
    
    //black making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && enPassantSquare != null && sameSquare(coord2,enPassantSquare)){
        if(debug)console.log("en passant")
        
        //moves pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        movePieceLogically( {"file":enPassantSquare.file,"rank":enPassantSquare.rank+1} , enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        movePieceLogically(coord1,coord2)
    }
    
    else{
    //move piece normally
    movePieceLogically(coord1,coord2)
    }
    
    //set enPassantSquare to null after a turn has passed where no enPassant has been made
    enPassantSquare = null
    
    //sets enPassantTargetSquare if a pawn moves two spaces
    if(toBeMoved.type == "p" && (targetSquare.rank-coord1.rank == -2)){
        enPassantSquare = {"file": coord1.file , "rank": coord1.rank-1};
    }else if(toBeMoved.type == "p" && (targetSquare.rank-coord1.rank == 2)){
        enPassantSquare = {"file": coord1.file , "rank": coord1.rank+1};
    }
    
    //updates the king square and castling rights for the king
    if(toBeMoved.type == "k"){
    
        if(whiteToMove){
        whiteKingSquare = targetSquare;
        whiteCanCastleLong = false;
        whiteCanCastleShort = false;
        }else{
        blackKingSquare = targetSquare;
        blackCanCastleLong = false;
        blackCanCastleShort = false;
        }
    }
    
    //updates castling rights for rooks
    if(toBeMoved.type == "r"){
        if(toBeMoved.file == 0 && toBeMoved.rank == 0 && toBeMoved.color == "white"){
            whiteCanCastleLong = false;
        }else if(toBeMoved.file == 7 && toBeMoved.rank == 0 && toBeMoved.color == "white"){
            whiteCanCastleShort = false;
        }else if(toBeMoved.file == 0 && toBeMoved.rank == 7 && toBeMoved.color == "black"){
            blackCanCastleLong = false;
        }else if(toBeMoved.file == 7 && toBeMoved.rank == 7 && toBeMoved.color == "black"){
            blackCanCastleShort = false;
        }
    }
    
    if(debug) console.log(")") 

    //changes player turns
    if(whiteToMove){    
        whiteToMove = false; 
        if(debug) console.log("it is now black to move") 
    }else{
        whiteToMove = true;
        if(debug) console.log("it is now white to move") 
    }

    loadFEN(generateFEN())

    //this needs to be at the end of the function!!!
    // Checks for checkmate
    if(squareInCheckFrom("black",whiteKingSquare) && !colorHasLegalMoves("white") ){
        displayVictoryFor("black")
    }
    if(squareInCheckFrom("white",blackKingSquare) && !colorHasLegalMoves("black") ){
        displayVictoryFor("white")
    }
            
    
}

//executes a move on the logical board to check whether or not it puts the king in check
function executeMoveLogically(coord1,coord2){
    if(debug) console.log("executing move(");
    
    toBeMoved = board[coord1.file][coord1.rank]
    targetSquare = {"file":coord2.file,"rank":coord2.rank}
    
    //promotion for white
    if(toBeMoved.type == "p" && toBeMoved.color == "white" && targetSquare.rank == 7){
        movePieceLogically(coord1,coord2);
        board[coord2.file][coord2.rank] = new Queen("white",coord2.file,coord2.rank);

    }
    //promotion for black
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && targetSquare.rank == 0){
        movePieceLogically(coord1,coord2);
        board[coord2.file][coord2.rank] = new Queen("black",coord2.file,coord2.rank);
    }

    //castle white short
    else if(toBeMoved.type == "k" && whiteCanCastleShort && sameSquare(targetSquare,{"file":6,"rank":0})){
        movePieceLogically(whiteKingSquare,{"file":6,"rank":0});
        movePieceLogically({"file":7,"rank":0} , {"file":5,"rank":0});
        whiteKingSquare = targetSquare;
    }
    
    //castle white long
    else if(toBeMoved.type == "k" && whiteCanCastleLong && sameSquare(targetSquare,{"file":2,"rank":0})){
        movePieceLogically(whiteKingSquare,{"file":2,"rank":0});
        movePieceLogically({"file":0,"rank":0} , {"file":3,"rank":0});
        whiteKingSquare = targetSquare;
    }
    
    //castle black short
    else if(toBeMoved.type == "k" && blackCanCastleShort && sameSquare(targetSquare,{"file":6,"rank":7})){
        movePieceLogically(blackKingSquare,{"file":6,"rank":7});
        movePieceLogically({"file":7,"rank":7} , {"file":5,"rank":7});
        blackKingSquare = targetSquare;
    }
    
    //castle black long
    else if(toBeMoved.type == "k" && blackCanCastleLong && sameSquare(targetSquare,{"file":2,"rank":7})){
        movePieceLogically(blackKingSquare,{"file":2,"rank":0});
        movePieceLogically({"file":0,"rank":7} , {"file":3,"rank":7});
        blackKingSquare = targetSquare; 
    }
    
    //white making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "white" && enPassantSquare != null && sameSquare(coord2,enPassantSquare)){
        
    
        //move pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        movePieceLogically( {"file":enPassantSquare.file,"rank":enPassantSquare.rank-1} , enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        movePieceLogically(coord1,coord2);

    }
    
    //black making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && enPassantSquare != null && sameSquare(coord2,enPassantSquare)){
        
        //moves pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        movePieceLogically( {"file":enPassantSquare.file,"rank":enPassantSquare.rank+1} , enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        movePieceLogically(coord1,coord2)
    }
    
    else{
    //move piece normally
    movePieceLogically(coord1,coord2)
    }


}
        
function movePieceLogically(coord1,coord2){
        
    if(debug) console.log("moving piece logically");
        
    if(sameSquare(coord1,coord2)){
        return;
    }

    board[coord2.file][coord2.rank] = board[coord1.file][coord1.rank];
    let newPiece = board[coord2.file][coord2.rank];

    newPiece.file = coord2.file;
    newPiece.rank = coord2.rank;
    
    board[coord1.file][coord1.rank] = null;
}

function sameSquare(coord1,coord2){
    if(coord1 == null || coord2 == null) return false;
    
    return(coord1.rank == coord2.rank && coord1.file == coord2.file)
}

function isLegalMove(coord1,coord2){

    if(sameSquare(coord1,coord2)){
        return false;
    }

    legalMoves = legalMovesFor(coord1)

    for( i = 0 ; i < legalMoves.length ; i++ ){
        if(sameSquare(legalMoves[i],coord2)){
            return true;
        }
    }

    return false;
}

function legalMovesFor(coord1){

    if(board[coord1.file][coord1.rank] == null || board[coord1.file][coord1.rank] == undefined) return  new Array(0);

    var pieceType = board[coord1.file][coord1.rank].type;
    var pieceColor = board[coord1.file][coord1.rank].color;
    var pieceFile = coord1.file;
    var pieceRank = coord1.rank;

    if(whiteToMove && pieceColor == 'black') return new Array(0);
    if(!whiteToMove && pieceColor == 'white') return new Array(0);

    let result = new Array(0);


    switch(pieceType){
    
    //==========================================Knight=================================
    case "n":{

        let knightMoves = [{"file":pieceFile+1,"rank":pieceRank+2},
                        {"file":pieceFile+1,"rank":pieceRank-2},
                        {"file":pieceFile+2,"rank":pieceRank+1},
                        {"file":pieceFile+2,"rank":pieceRank-1},
                        {"file":pieceFile-1,"rank":pieceRank+2},
                        {"file":pieceFile-1,"rank":pieceRank-2},
                        {"file":pieceFile-2,"rank":pieceRank+1},
                        {"file":pieceFile-2,"rank":pieceRank-1}]

        for(let i = 0 ; i < 8 ; i++){
            
            if([knightMoves[i].file] >= 0 && [knightMoves[i].file] <= 7 && [knightMoves[i].rank] >=0 && [knightMoves[i].rank] <=7){
                if(pieceColor == 'white' && board[knightMoves[i].file][knightMoves[i].rank] != null && board[knightMoves[i].file][knightMoves[i].rank].color == 'white' ) continue;
                if(pieceColor == 'black' && board[knightMoves[i].file][knightMoves[i].rank] != null && board[knightMoves[i].file][knightMoves[i].rank].color == 'black' ) continue;
                result.push(knightMoves[i]);
            }
        }

    }break;

    //==========================================Pawn==========================================
    case "p":{
        
        if(pieceColor == "white"){

            pawnMoves = [{"file":pieceFile+1,"rank":pieceRank+1},
                        {"file":pieceFile-1,"rank":pieceRank+1},
                        {"file":pieceFile,"rank":pieceRank+2},
                        {"file":pieceFile,"rank":pieceRank+1}]


        }else{       

            pawnMoves = [{"file":pieceFile+1,"rank":pieceRank-1},
                        {"file":pieceFile-1,"rank":pieceRank-1},
                        {"file":pieceFile,"rank":pieceRank-2},
                        {"file":pieceFile,"rank":pieceRank-1}]

        }

        for(let i = 0 ; i < 4 ; i++){

            if([pawnMoves[i].file] >= 0 && [pawnMoves[i].file] <= 7 && [pawnMoves[i].rank] >=0 && [pawnMoves[i].rank] <=7){
                
                if(pieceColor == "white"){
                    //checks if a legal capture or enPassant move can be made on either side
                    if(pawnMoves[i].rank == coord1.rank+1 && pawnMoves[i].file == coord1.file+1 && (board[pawnMoves[i].file][pawnMoves[i].rank] != null && board[pawnMoves[i].file][pawnMoves[i].rank].color != 'white' || sameSquare(pawnMoves[i],enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    if(pawnMoves[i].rank == coord1.rank+1 && pawnMoves[i].file == coord1.file-1 && (board[pawnMoves[i].file][pawnMoves[i].rank] != null && board[pawnMoves[i].file][pawnMoves[i].rank].color != 'white' || sameSquare(pawnMoves[i],enPassantSquare))){ 
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    //cannot move backwards
                    if(pawnMoves[i].rank <= coord1.rank) continue
                    //pawn can move two squares only on first move
                    if((pawnMoves[i].rank >= coord1.rank+2 && coord1.rank != 1) || pawnMoves[i].rank >= coord1.rank+3 ) continue;
                    //pawns cannot jump
                    if(pawnMoves[i].rank >= coord1.rank+2 && board[coord1.file][coord1.rank+1]!=null) continue;
                    //pawns cannot capture forwards
                    if(coord1.file == pawnMoves[i].file && board[pawnMoves[i].file][pawnMoves[i].rank] != null) continue;
                    //ensures pawns stay on file
                    if(pawnMoves[i].file!=coord1.file) continue;
        
                }else{       
                    
                    //checks if a legal capture or enPassant move can be made on either side
                    if(pawnMoves[i].rank == coord1.rank-1 && pawnMoves[i].file == coord1.file+1 && (board[pawnMoves[i].file][pawnMoves[i].rank] != null && board[pawnMoves[i].file][pawnMoves[i].rank].color != 'black' || sameSquare(pawnMoves[i],enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    if(pawnMoves[i].rank == coord1.rank-1 && pawnMoves[i].file == coord1.file-1 && (board[pawnMoves[i].file][pawnMoves[i].rank] != null && board[pawnMoves[i].file][pawnMoves[i].rank].color != 'black'|| sameSquare(pawnMoves[i],enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    //cannot move backwards         
                    if(pawnMoves[i].rank >= coord1.rank) continue;
                    //pawn can move two squares only on first move
                    if((pawnMoves[i].rank <= coord1.rank-2 && coord1.rank != 6) || pawnMoves[i].rank <= coord1.rank-3) continue;
                    //pawns cannot jump
                    if(pawnMoves[i].rank >= coord1.rank-2 && board[coord1.file][coord1.rank-1]!=null) continue;
                    //pawns cannot capture forwards
                    if(coord1.file == pawnMoves[i].file && board[pawnMoves[i].file][pawnMoves[i].rank] != null) continue;  
                    //ensures pawns stay on file
                    if(pawnMoves[i].file != coord1.file) continue;
                }  
                result.push(pawnMoves[i]);
            }
        }

  

    }break;

    //==========================================Bishop========================================
    case "b":{

        //Looks in every diagonal direction and compiles a list of legal moves.
        //If the attempted move is in the list the move can be made.

        i = pieceFile+1
        j = pieceRank+1

        while(i < 8 && j < 8){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i++;
            j++;
        }

        i = pieceFile-1
        j = pieceRank+1

        while(i >= 0 && j < 8){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i--;
            j++;
        }

        i = pieceFile-1
        j = pieceRank-1

        while(i >= 0 && j >= 0){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i--;
            j--;
        }

        i = pieceFile+1
        j = pieceRank-1

        while(i < 8 && j >= 0){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i++;
            j--;
        }

    }break;

    //==========================================Rook==========================================
    case "r":{
        //Looks in every direction and compiles a list of legal moves.
        //If the attempted move is in the list the move can be made.
    
        for(let i = pieceRank+1 ; i < 8 ; i++){
            if(board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }

        }
        for(let i = pieceRank-1 ; i >= 0 ; i--){    
            if(board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
        }
        for(let i = pieceFile+1 ; i < 8 ; i++){
            
            if(board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }

        }
        for(let i = pieceFile-1 ; i >= 0 ; i--){

            if(board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }

        }
    }break;

    //===========================================Queen=========================================
    case "q":{
        for(let i = pieceRank+1 ; i < 8 ; i++){
            if(board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }

        }
        for(let i = pieceRank-1 ; i >= 0 ; i--){    
            if(board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
        }
        for(let i = pieceFile+1 ; i < 8 ; i++){
            
            if(board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }

        }
        for(let i = pieceFile-1 ; i >= 0 ; i--){

            if(board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }

        }

        i = pieceFile+1
        j = pieceRank+1

        while(i < 8 && j < 8){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i++;
            j++;
        }

        i = pieceFile-1
        j = pieceRank+1

        while(i >= 0 && j < 8){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i--;
            j++;
        }

        i = pieceFile-1
        j = pieceRank-1

        while(i >= 0 && j >= 0){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i--;
            j--;
        }

        i = pieceFile+1
        j = pieceRank-1

        while(i < 8 && j >= 0){
            if(board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(board[i][j].color != pieceColor){
                result.push({"file":i,"rank":j})
                break;
            }else{
                break;
            }
            i++;
            j--;
        }
    }break;

    //===========================================King=========================================
    case "k" :{

        let kingMoves = [{"file":pieceFile+1,"rank":pieceRank+1},
                        {"file":pieceFile+1,"rank":pieceRank},
                        {"file":pieceFile+1,"rank":pieceRank-1},
                        {"file":pieceFile,"rank":pieceRank-1},
                        {"file":pieceFile-1,"rank":pieceRank-1},
                        {"file":pieceFile-1,"rank":pieceRank},
                        {"file":pieceFile-1,"rank":pieceRank+1},
                        {"file":pieceFile,"rank":pieceRank+1}]

        for(var i = 0 ; i < kingMoves.length ; i++){
             
            if( kingMoves[i].rank > 7 || kingMoves[i].rank < 0  ||kingMoves[i].file > 7 || kingMoves[i].file < 0  || board[kingMoves[i].file][kingMoves[i].rank] != null && board[kingMoves[i].file][kingMoves[i].rank].color == pieceColor){
                continue;
            }
            result.push(kingMoves[i]);
        }    

        //makes sure that castling rights are respected and prevents castling through check or friendly pieces
        
        //white castling short
        if(whiteToMove && whiteCanCastleShort && !squareInCheckFrom("black",whiteKingSquare) && !squareInCheckFrom("black",{"file":5,"rank":0}) && board[5][0] == null && board[6][0] == null )
        {
            result.push({"file":pieceFile+2,"rank":pieceRank})
        }

        //white castling long
        if(whiteToMove && whiteCanCastleLong && !squareInCheckFrom("black",whiteKingSquare) && !squareInCheckFrom("black",{"file":3,"rank":0}) && board[1][0] == null && board[2][0] == null && board[3][0] == null)
        {
            result.push({"file":pieceFile-2,"rank":pieceRank})
        }

        //black castling short
        if(!whiteToMove && blackCanCastleShort && !squareInCheckFrom("white",blackKingSquare) && !squareInCheckFrom("white",{"file":5,"rank":7}) && board[5][7] == null && board[6][7] == null )
        {
            result.push({"file":pieceFile+2,"rank":pieceRank})
        }

        //black castling long
        if(!whiteToMove && blackCanCastleLong && !squareInCheckFrom("white",blackKingSquare) && !squareInCheckFrom("black",{"file":3,"rank":7}) && board[1][7] == null && board[2][7] == null && board[3][7] == null)
        {
            result.push({"file":pieceFile-2,"rank":pieceRank})
        }

    }

    }

    //checks if the move puts the king in check
    for(var i = result.length-1 ; i >= 0 ; i--){
        if(putsKingInCheck(pieceColor , coord1 , result[i])){
            result.splice(i,1);
        }
    }

    console.log(result)

    return result;
}

function putsKingInCheck(color,originalSquare,endSquare){

    if(debug) console.log("checking if the "+color+" king is in put in check by this move");

    let result = false;
    
    
    // saves a copy of the original board
    const originalBoard = []
    
    const originalDarkKingSquare = blackKingSquare
    const originalLightKingSquare = whiteKingSquare
    
    for(i = 0 ; i < 8 ; i++){
        originalBoard[i] = board[i].slice()
    }
    
    
    let rank1 = originalSquare.rank
    let file1 = originalSquare.file
    
    let rank2 = endSquare.rank
    let file2 = endSquare.file
    
    if(board[file1][rank1].type == "k" && board[file1][rank1].color == "white") whiteKingSquare = {"file":file2,"rank":rank2};
    if(board[file1][rank1].type == "k" && board[file1][rank1].color == "black") blackKingSquare = {"file":file2,"rank":rank2};
    
    //performs a said move on the game board
    
    executeMoveLogically({"file":file1,"rank":rank1},{"file":file2,"rank":rank2})
    
    //checks if the move puts the king in check or not
    
    if(color == "white"){
        result = squareInCheckFrom("black",whiteKingSquare)
    }else{
        result = squareInCheckFrom("white",blackKingSquare)
    }
    
    //copies board back to original state
    
    for(i = 0 ; i < 8 ; i++){
        board[i] = originalBoard[i].slice()
    }
    blackKingSquare = originalDarkKingSquare 
    whiteKingSquare = originalLightKingSquare
    
    //if(result == true) console.log("the king cannot be in check") 
    
    //return whether a certain move put the king in check
    
    return result;
}

function squareInCheckFrom(color , targetSquare){

    if(debug) console.log("checking if square (" + targetSquare.file+","+targetSquare.rank+") is in check from " + color);

let enemyColor = color;
let file = targetSquare.file;
let rank = targetSquare.rank;


//Checks attacks by pawns

if(enemyColor == "white"){
    if(file>=1 && rank>=1 &&
        board[file-1][rank-1] != null && 
        board[file-1][rank-1].type == "p" && 
        board[file-1][rank-1].color == enemyColor){return true;}
    if(targetSquare.file<=6 && rank>=1 &&
        board[file+1][rank-1] != null && 
        board[file+1][rank-1].type == "p" && 
        board[file+1][rank-1].color == enemyColor){return true;}


}else{
    if(file>=1 && rank<=6 &&
        board[file-1][rank+1] != null && 
        board[file-1][rank+1].type == "p" && 
        board[file-1][rank+1].color == enemyColor){return true;}
    if(targetSquare.file<=6 && rank>=1 &&
        board[file+1][rank+1] != null && 
        board[file+1][rank+1].type == "p" && 
        board[file+1][rank+1].color == enemyColor){return true;}
}

//Checking for attacks on files and diagonals functions in a similar manner. 
//The function iterates through all squares in all four directions, one direction at a time.
//If a square is empty the funciton will continue iterating in that direction.
//If a square is occupied by a friendly piece or a piece incapable of checking the king, the function will break off the search in that direction and change directions.
//If a square is occupied by a square capable of checking the king the function will return true.


//Checks for attacks on diagonals

i = file+1
j = rank+1

while(i < 8 && j < 8){
    if(board[i][j]==null){
         
    }else if(board[i][j].color != enemyColor || ( board[i][j].type != "b" && board[i][j].type != "q" )){
        break;
    }else if(board[i][j].type == "b" || board[i][j].type == "q" && board[i][j].color == enemyColor){
        {return true;}
    }
    i++;
    j++;
}

i = file-1
j = rank+1

while(i >= 0 && j < 8){
    if(board[i][j]==null){
         
    }else if(board[i][j].color != enemyColor  || ( board[i][j].type != "b" && board[i][j].type != "q" )){
        break;
    }else if(board[i][j].type == "b" || board[i][j].type == "q" && board[i][j].color == enemyColor){
        {return true;}
    }
    i--;
    j++;
}

i = file-1
j = rank-1

while(i >= 0 && j >= 0){
    if(board[i][j]==null){
         
    }else if(board[i][j].color != enemyColor  || ( board[i][j].type != "b" && board[i][j].type != "q" )){
        break;
    }else if(board[i][j].type == "b" || board[i][j].type == "q" && board[i][j].color == enemyColor){
        {return true;}
    }
    i--;
    j--;
}

i = file+1
j = rank-1

while(i < 8 && j >= 0){
    if(board[i][j]==null){
         
    }else if(board[i][j].color != enemyColor || ( board[i][j].type != "b" && board[i][j].type != "q" )){
        break;
    }else if(board[i][j].type == "b" || board[i][j].type == "q" && board[i][j].color == enemyColor){
        {return true;}
    }
    i++;
    j--;
}

//checks for threats on ranks and files

for(i = rank+1 ; i < 8 ; i++){
    if(board[file][i]==null){
    
    }
    else if(board[file][i].color != enemyColor  || ( board[file][i].type != "q" && board[file][i].type != "r" )){
        break;
    }else if(board[file][i].color == enemyColor && board[file][i].type == "q" ||board[file][i].type == "r") {
        {return true;}
    }

}
for(i = rank-1 ; i >= 0 ; i--){    
    if(board[file][i]==null){
    
    }
    else if(board[file][i].color != enemyColor || ( board[file][i].type != "q" && board[file][i].type != "r" )){
        break;
    }else if(board[file][i].color == enemyColor && board[file][i].type == "q" ||board[file][i].type == "r") {
        {return true;}
    }
}
for(i = file+1 ; i < 8 ; i++){
    
    if(board[i][rank]==null){
    
    }
    else if(board[i][rank].color != enemyColor || ( board[i][rank].type != "q" && board[i][rank].type != "r" )){
        break;
    }else if(board[i][rank].color == enemyColor && board[i][rank].type == "q" ||board[i][rank].type == "r") {
        {return true;}
    }

}
for(i = file-1 ; i >= 0 ; i--){

    if(board[i][rank]==null){
    
    }
    else if(board[i][rank].color != enemyColor || ( board[i][rank].type != "q" && board[i][rank].type != "r" )){
        break;
    }else if(board[i][rank].color == enemyColor && board[i][rank].type == "q" ||board[i][rank].type == "r") {
        {return true;}
    }

}

//checks for threats on knight moves
    if(typeof(board[file+1]) != "undefined" && typeof(board[file+1][rank+2]) != "undefined" && board[file+1][rank+2] != null && board[file+1][rank+2].color == enemyColor && board[file+1][rank+2].type == "n") return true;
    if(typeof(board[file+1]) != "undefined" && typeof(board[file+1][rank-2]) != "undefined" && board[file+1][rank-2] != null && board[file+1][rank-2].color == enemyColor && board[file+1][rank-2].type == "n") return true;
    if(typeof(board[file+2]) != "undefined" && typeof(board[file+2][rank+1]) != "undefined" && board[file+2][rank+1] != null && board[file+2][rank+1].color == enemyColor && board[file+2][rank+1].type == "n") return true;
    if(typeof(board[file+2]) != "undefined" && typeof(board[file+2][rank-1]) != "undefined" && board[file+2][rank-1] != null && board[file+2][rank-1].color == enemyColor && board[file+2][rank-1].type == "n") return true;
    if(typeof(board[file-1]) != "undefined" && typeof(board[file-1][rank+2]) != "undefined" && board[file-1][rank+2] != null && board[file-1][rank+2].color == enemyColor && board[file-1][rank+2].type == "n") return true;
    if(typeof(board[file-1]) != "undefined" && typeof(board[file-1][rank-2]) != "undefined" && board[file-1][rank-2] != null && board[file-1][rank-2].color == enemyColor && board[file-1][rank-2].type == "n") return true;
    if(typeof(board[file-2]) != "undefined" && typeof(board[file-2][rank+1]) != "undefined" && board[file-2][rank+1] != null && board[file-2][rank+1].color == enemyColor && board[file-2][rank+1].type == "n") return true;
    if(typeof(board[file-2]) != "undefined" && typeof(board[file-2][rank-1]) != "undefined" && board[file-2][rank-1] != null && board[file-2][rank-1].color == enemyColor && board[file-2][rank-1].type == "n") return true;

//checks for king threats
    if(typeof(board[file+1]) != "undefined" && typeof(board[file+1][rank+1]) != "undefined" && board[file+1][rank+1] != null && board[file+1][rank+1].color == enemyColor && board[file+1][rank+1].type == "k") return true;
    if(typeof(board[file+1]) != "undefined" && typeof(board[file+1][rank]) != "undefined" && board[file+1][rank] != null && board[file+1][rank].color == enemyColor && board[file+1][rank].type == "k") return true;
    if(typeof(board[file+1]) != "undefined" && typeof(board[file+1][rank-1]) != "undefined" && board[file+1][rank-1] != null && board[file+1][rank-1].color == enemyColor && board[file+1][rank-1].type == "k") return true;
    if(typeof(board[file]) != "undefined" && typeof(board[file][rank-1]) != "undefined" && board[file][rank-1] != null && board[file][rank-1].color == enemyColor && board[file][rank-1].type == "k") return true;
    if(typeof(board[file-1]) != "undefined" && typeof(board[file-1][rank-1]) != "undefined" && board[file-1][rank-1] != null && board[file-1][rank-1].color == enemyColor && board[file-1][rank-1].type == "k") return true;
    if(typeof(board[file-1]) != "undefined" && typeof(board[file-1][rank]) != "undefined" && board[file-1][rank] != null && board[file-1][rank].color == enemyColor && board[file-1][rank].type == "k") return true;
    if(typeof(board[file-1]) != "undefined" && typeof(board[file-1][rank+1]) != "undefined" && board[file-1][rank+1] != null && board[file-1][rank+1].color == enemyColor && board[file-1][rank+1].type == "k") return true;
    if(typeof(board[file]) != "undefined" && typeof(board[file][rank+1]) != "undefined" && board[file][rank+1] != null && board[file][rank+1].color == enemyColor && board[file][rank+1].type == "k") return true;

return false;

}

//returns an array of all legal moves for one color of pieces
function colorHasLegalMoves(color){

    if(debug) console.log("getting all legal moves for:"+color);
    
    result = new Array()
    
    for(let i = 0 ; i < 8 ; i++){
        for(let j = 0 ; j < 8 ; j++){
            if(board[i][j]!=null && board[i][j].color == color){
                legalMovesFor({"file":i,"rank":j}).forEach(move => {
                    result.push(move)
                })
            }
        }
    }
    
    return result.length>0
}

function generateFEN(){
    result = ""
    counter = 0;

    for(i = 7 ; i >=0 ; i--){
        if(i < 7)result += "/"
        for(j = 0 ; j < 8 ; j++){
            if(board[j][i] != null){
                pieceName = board[j][i].type;
                if(board[j][i].color == "white") pieceName = pieceName.toUpperCase();
                
                if(counter>0){
                    result += counter + pieceName;
                    counter = 0;
                }else{
                    result += pieceName;
                }
            }else{
                counter++;
            }
        }
        if(counter > 0){
            result+=counter;
        }
        counter = 0;
    }

    if(whiteToMove){
        result += " w"
    }else{
        result += " b"
    }


    result += " "
    if(whiteCanCastleShort) result += "K";
    if(whiteCanCastleLong) result += "Q";
    if(blackCanCastleShort) result += "k";
    if(blackCanCastleLong) result += "q";
    if(result.substring(result.length-1,result.length) == " ") result += "-"


    if(enPassantSquare == null){
        result += " -"
    }else{
        result += " "+alphabet.substring(enPassantSquare.file,enPassantSquare.file+1)+(enPassantSquare.rank+1);
    }

    result += " "+halfMoveClock

    result += " "+fullMoveNumber

    return result;
}

function loadFEN(FENString){
    
    boardContainer.innerHTML = " ";

    board = new Array(8)

    for(i = 0 ; i < board.length; i++){
        board[i] = new Array(8);
    }

    for(i = 0 ; i < 8 ; i++){
        for(j = 0 ; j < 8 ; j++){
            board[i][j] = null;
        }   
    }

    file = 0;
    rank = 7;
    
    for(i = 0 ; i < FENString.indexOf(" ") ; i++){
        switch(FENString.substring(i,i+1)){

            case "/":{
                rank--;
                file = 0;
            } break;
            case "1":{
                file+=1;
            } break;
            case "2":{
                file+=2;
            } break;
            case "3":{
                file+=3;
            } break;
            case "4":{
                file+=4;
            } break;
            case "5":{
                file+=5;
            } break;
            case "6":{
                file+=6;
            } break;
            case "7":{
                file+=7;
            } break;
            case "8":{
                file+=8;
            } break;
            case "k":{
                board[file][rank] = new King("black",file,rank);
                blackKingSquare = {"file":file, "rank":rank};
                file++;
            } break;
            case "q":{
                board[file][rank] = new Queen("black",file,rank);
                file++;
            } break;
            case "r":{
                board[file][rank] = new Rook("black",file,rank);
                file++;
            } break;
            case "b":{
                board[file][rank] = new Bishop("black",file,rank);
                file++;
            } break;
            case "n":{
                board[file][rank] = new Knight("black",file,rank);
                file++;
            } break;
            case "p":{
                board[file][rank] = new Pawn("black",file,rank);
                file++;
            } break;
            case "K":{
                board[file][rank] = new King("white",file,rank);
                whiteKingSquare = {"file":file, "rank":rank};
                file++;
            } break;
            case "Q":{
                board[file][rank] = new Queen("white",file,rank);
                file++;
            } break;
            case "R":{
                board[file][rank] = new Rook("white",file,rank);
                file++;
            } break;
            case "B":{
                board[file][rank] = new Bishop("white",file,rank);
                file++;
            } break;
            case "N":{
                board[file][rank] = new Knight("white",file,rank);
                file++;
            } break;
            case "P":{
                board[file][rank] = new Pawn("white",file,rank);
                file++;
            } break;

        }
    }

    FENString = FENString.substring(FENString.indexOf(" ") + 1);

    if(FENString.substring(0,1) == "w"){
        whiteToMove = true;
    }
    if(FENString.substring(0,1) == "b"){
        whiteToMove = false;
    }

    FENString = FENString.substring(FENString.indexOf(" ") + 1);

    for(i = 0 ; i < FENString.indexOf(" ") ; i++){
        switch(FENString.substring(i,i+1)){
            case "k" : {
                blackCanCastleShort = true;
            }break;
            case "q" : {
                blackCanCastleLong = true;
            }break;
            case "K" : {
                whiteCanCastleShort = true;
            }break;
            case "Q" : {
                whiteCanCastleLong = true;
            }break;
            case "-" : {
                whiteCanCastleLong = false;
                whiteCanCastleShort = false;
                blackCanCastleLong = false;
                blackCanCastleShort = false;
            }break;

        }
    }

    FENString = FENString.substring(FENString.indexOf(" ") + 1);

    if(FENString.substring(0,1) != "-"){
        alphabet = "abcdefgh"
        enPassantSquare = {"file":alphabet.indexOf(FENString.substring(0,1)) , "rank":parseInt(FENString.substring(1,2)-1)}
    }

    FENString = FENString.substring(FENString.indexOf(" ") + 1);

    halfMoveClock = parseInt(FENString.substring(0,FENString.indexOf(" ")))

    FENString = FENString.substring(FENString.indexOf(" ") + 1);

    fullMoveNumber = parseInt(FENString.substring(0))

    if(boardFacingWhite){
        for(i = 0 ; i < 8 ; i++){
            for(j = 0 ; j < 8 ; j++){
                if(board[i][j] != null){
                    boardContainer.innerHTML+=`<img id = "${i.toString()+j.toString()}" class = "piece" src = "${board[i][j].imagePath}"
                            style = "left:${board[i][j].file*(squareSize)}px; 
                                    bottom:${board[i][j].rank*(squareSize)}px; "
                            >`
                }
            }
        }
    }else{
        for(i = 0 ; i < 8 ; i++){
            for(j = 0 ; j < 8 ; j++){
                if(board[i][j] != null){
                    boardContainer.innerHTML+=`<img id = "${i.toString()+j.toString()}" class = "piece" src = "${board[i][j].imagePath}"
                            style = "left:${Math.abs(board[i][j].file-7)*(squareSize)}px; 
                                    bottom:${Math.abs(board[i][j].rank-7)*(squareSize)}px; "
                            >`
                }
            }
        }
    }

    // Checks for checkmate
    if(squareInCheckFrom("black",whiteKingSquare) && !colorHasLegalMoves("white") ){
        displayVictoryFor("black")

    }else if(squareInCheckFrom("white",blackKingSquare) && !colorHasLegalMoves("black") ){
        displayVictoryFor("white")

    }

    FENDisplay.innerHTML = generateFEN();

}

function initializeBoard(){
    loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}

function flipBoard(){
    for(var i = 0 ; i < 8 ; i++){
        for(var j = 0 ; j < 8 ;j++){
            if(board[i][j] == null) continue;

            boardContainer.removeChild(document.getElementById(`${i}${j}`));
            if(boardFacingWhite){
            boardContainer.innerHTML+=`<img id = "${i.toString()+j.toString()}" class = "piece" src = "${board[i][j].imagePath}"
            style = "left:${Math.abs(board[i][j].file - 7) *(squareSize)}px; 
                    bottom:${Math.abs(board[i][j].rank - 7)*(squareSize)}px; "
            >`
            }
            else if(!boardFacingWhite){
                boardContainer.innerHTML+=`<img id = "${i.toString()+j.toString()}" class = "piece" src = "${board[i][j].imagePath}"
                style = "left:${board[i][j].file *(squareSize)}px; 
                        bottom:${board[i][j].rank *(squareSize)}px; "
                >`
            }
            
        }
    }

    if(boardFacingWhite){
        boardFacingWhite = false;
    }else if(!boardFacingWhite){
        boardFacingWhite = true;
    }
}

function displayVictoryFor(color){
    if(color === "white"){
        console.log("white")
        boardContainer.innerHTML += `<div class = "display-victory , white">'WHITE WINS'</div>`
    }else if(color === "black"){
        console.log("black")
        boardContainer.innerHTML += `<div class = "display-victory , black">'BLACK WINS'</div>`
    }else{
        console.log("stalemate")
        boardContainer.innerHTML += `<div class = "display-victory , stalemate">'STALEMATE'</div>`
    }
}

function evaluatePosition(FENString){
    var result = 0.0

    var rank = 8
    
    for(var i = 0 ; i < FENString.indexOf(" ") ; i++){
        switch(FENString.substring(i,i+1)){
            case "Q":{
                result += 9
            }break;
            case "R":{
                result += 5
            }break;
            case "B":{
                result += 3
            }break;
            case "N":{
                result += 3
            }break;
            case "P":{
                result += 1 
                if(rank > 2) result += .5;
                if(rank > 5) result += 1.5;
            }break;
            case "q":{
                result -= 9
            }break;
            case "r":{
                result -= 5
            }break;
            case "b":{
                result -= 3
            }break;
            case "n":{
                result -= 3
            }break;
            case "p":{
                result -= 1
                if(rank <7) result -= .5;
                if(rank <4) result -= 1.5;
            }break;
            case "/":{
                rank--;
            }
            default:{

            }break;
        }
    }

    return result;
}

initializeBoard()

/* ================================Change Log========================

5:58pm 7/16/2021
Eliminated the need for a movePiecePhysicallyFunction by simply rendering the game board anew everytime a move has been executed.

*/