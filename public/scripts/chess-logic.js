//===========================Board Class================================

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

class Board{

    constructor(id){
        this.blackPlayer = null;
        this.whitePlayer = null;
        this.spectators = new Array(0);
        this.owner = "";
        this.password = "";
        this.boardID = id

        this.board;
        this.whiteToMove = true;
        this.enPassantSquare = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 0;
        this.alphabet = "abcdefgh";
        this.whiteCanCastleShort;
        this.whiteCanCastleLong;
        this.blackCanCastleShort;
        this.blackCanCastleLong;
        this.boardFEN; 
        this.debug = false;
        this.blackKingSquare = {"file":4,"rank":7}
        this.whiteKingSquare = {"file":4,"rank":0}
    }


    setWhitePlayer = function(user){
        this.whitePlayer = user;
    }

    setblackPlayer = function(user){
        this.blackPlayer = user;
    }

    addSpectator = function(user){
        this.spectators.push(user)
    }

    removeUser = function(id){
        if(this.blackPlayer.id == id){
            this.blackPlayer = null
        }
        if(this.whitePlayer.id == id){
            this.whitePlayer = null
        }
        for(var i = 0 ; i < this.spectators.length ; i--){
            this.spectators.splice(i,1);
        }
    }

    //trys to make a move on the game this.board
    attemptToMove = function(coord1,coord2){

    if(this.debug) console.log("attempting to move");
  
    if(this.isLegalMove(coord1,coord2)){
        this.executeMove(coord1,coord2)
    }
  
  }
  
  //executes a move on the game this.board both physcally and logically including special events like castling and en passant
  executeMove = function(coord1,coord2){ 
  
    if(this.debug) console.log("executing move(");
    
    var toBeMoved = this.board[coord1.file][coord1.rank]
    var targetSquare = {"file":coord2.file,"rank":coord2.rank}
    
    //promotion for white
    if(toBeMoved.type == "p" && toBeMoved.color == "white" && targetSquare.rank == 7){
        this.movePieceLogically(coord1,coord2);
        this.board[coord2.file][coord2.rank] = new Queen("white",coord2.file,coord2.rank);
  
    }
    //promotion for black
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && targetSquare.rank == 0){
        this.movePieceLogically(coord1,coord2);
        this.board[coord2.file][coord2.rank] = new Queen("black",coord2.file,coord2.rank);
    }
  
  
    //castle white short
    else if(toBeMoved.type == "k" && this.whiteCanCastleShort && this.sameSquare(targetSquare,{"file":6,"rank":0}) ){
        this.movePieceLogically(this.whiteKingSquare,{"file":6,"rank":0});
        this.movePieceLogically({"file":7,"rank":0} , {"file":5,"rank":0});
    }
    
    //castle white long
    else if(toBeMoved.type == "k" && this.whiteCanCastleLong && this.sameSquare(targetSquare,{"file":2,"rank":0})){
        this.movePieceLogically(this.whiteKingSquare,{"file":2,"rank":0});
        this.movePieceLogically({"file":0,"rank":0} , {"file":3,"rank":0});
    }
    
    //castle black short
    else if(toBeMoved.type == "k" && this.blackCanCastleShort && this.sameSquare(targetSquare,{"file":6,"rank":7})){
        this.movePieceLogically(this.blackKingSquare,{"file":6,"rank":7});
        this.movePieceLogically({"file":7,"rank":7} , {"file":5,"rank":7});
    }
    
    //castle black long
    else if(toBeMoved.type == "k" && this.blackCanCastleLong && this.sameSquare(targetSquare,{"file":2,"rank":7})){
        this.movePieceLogically(this.blackKingSquare,{"file":2,"rank":0});
        this.movePieceLogically({"file":0,"rank":7} , {"file":3,"rank":7});
    }
    
    //white making an en passant movethis.
    else if(toBeMoved.type == "p" && toBeMoved.color == "white" && this.enPassantSquare != null && this.sameSquare(coord2 ,this.enPassantSquare)){
        if(this.debug)console.log("en passant")
        
    
        //move pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        this.movePieceLogically( {"file":this.enPassantSquare.file,"rank":this.enPassantSquare.rank-1} , this.enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        this.movePieceLogically(coord1,coord2) 
    }
    
    //black making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && this.enPassantSquare != null && this.sameSquare(coord2 ,this.enPassantSquare)){
        if(this.debug)console.log("en passant")
        
        //moves pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        this.movePieceLogically( {"file":this.enPassantSquare.file,"rank":this.enPassantSquare.rank+1} , this.enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        this.movePieceLogically(coord1,coord2)
    }
    
    else{
    //move piece normally
    this.movePieceLogically(coord1,coord2)
    }
    
    //set this.enPassantSquare to null after a turn has passed where no enPassant has been made
    this.enPassantSquare = null
    
    //sets enPassantTargetSquare if a pawn moves two spaces
    if(toBeMoved.type == "p" && (targetSquare.rank-coord1.rank == -2)){
        this.enPassantSquare = {"file": coord1.file , "rank": coord1.rank-1};
    }else if(toBeMoved.type == "p" && (targetSquare.rank-coord1.rank == 2)){
        this.enPassantSquare = {"file": coord1.file , "rank": coord1.rank+1};
    }
    
    //updates the king square and castling rights for the king
    if(toBeMoved.type == "k"){
    
        if(this.whiteToMove){
        this.whiteKingSquare = targetSquare;
        this.whiteCanCastleLong = false;
        this.whiteCanCastleShort = false;
        }else{
        this.blackKingSquare = targetSquare;
        this.blackCanCastleLong = false;
        this.blackCanCastleShort = false;
        }
    }
    
    //updates castling rights for rooks
    if(toBeMoved.type == "r"){
        if(toBeMoved.file == 0 && toBeMoved.rank == 0 && toBeMoved.color == "white"){
            this.whiteCanCastleLong = false;
        }else if(toBeMoved.file == 7 && toBeMoved.rank == 0 && toBeMoved.color == "white"){
            this.whiteCanCastleShort = false;
        }else if(toBeMoved.file == 0 && toBeMoved.rank == 7 && toBeMoved.color == "black"){
            this.blackCanCastleLong = false;
        }else if(toBeMoved.file == 7 && toBeMoved.rank == 7 && toBeMoved.color == "black"){
            this.blackCanCastleShort = false;
        }
    }
    
    if(this.debug) console.log(")") 
  
    //changes player turns
    if(this.whiteToMove){    
        this.whiteToMove = false; 
        if(this.debug) console.log("it is now black to move") 
    }else{
        this.whiteToMove = true;
        if(this.debug) console.log("it is now white to move") 
    }
  
    this.boardFEN = this.generateFEN()
    this.loadFEN(this.generateFEN())
  
    //this needs to be at the end of the function!!!
    // Checks for checkmate
    if(this.squareInCheckFrom("black",this.whiteKingSquare) && !this.colorHasLegalMoves("white") ){
        this.displayVictoryFor("black")
    }
    if(this.squareInCheckFrom("white",this.blackKingSquare) && !this.colorHasLegalMoves("black") ){
        this.displayVictoryFor("white")
    }
            
    
  }
  
  //executes a move on the logical this.board to check whether or not it puts the king in check
  executeMoveLogically = function(coord1,coord2){
    if(this.debug) console.log("executing move(");
    
    let toBeMoved = this.board[coord1.file][coord1.rank]
    let targetSquare = {"file":coord2.file,"rank":coord2.rank}
    
    //promotion for white
    if(toBeMoved.type == "p" && toBeMoved.color == "white" && targetSquare.rank == 7){
        this.movePieceLogically(coord1,coord2);
        this.board[coord2.file][coord2.rank] = new Queen("white",coord2.file,coord2.rank);
  
    }
    //promotion for black
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && targetSquare.rank == 0){
        this.movePieceLogically(coord1,coord2);
        this.board[coord2.file][coord2.rank] = new Queen("black",coord2.file,coord2.rank);
    }
  
    //castle white short
    else if(toBeMoved.type == "k" && this.whiteCanCastleShort && this.sameSquare(targetSquare,{"file":6,"rank":0})){
        this.movePieceLogically(this.whiteKingSquare,{"file":6,"rank":0});
        this.movePieceLogically({"file":7,"rank":0} , {"file":5,"rank":0});
        this.whiteKingSquare = targetSquare;
    }
    
    //castle white long
    else if(toBeMoved.type == "k" && this.whiteCanCastleLong && this.sameSquare(targetSquare,{"file":2,"rank":0})){
        this.movePieceLogically(this.whiteKingSquare,{"file":2,"rank":0});
        this.movePieceLogically({"file":0,"rank":0} , {"file":3,"rank":0});
        this.whiteKingSquare = targetSquare;
    }
    
    //castle black short
    else if(toBeMoved.type == "k" && this.blackCanCastleShort && this.sameSquare(targetSquare,{"file":6,"rank":7})){
        this.movePieceLogically(this.blackKingSquare,{"file":6,"rank":7});
        this.movePieceLogically({"file":7,"rank":7} , {"file":5,"rank":7});
        this.blackKingSquare = targetSquare;
    }
    
    //castle black long
    else if(toBeMoved.type == "k" && this.blackCanCastleLong && this.sameSquare(targetSquare,{"file":2,"rank":7})){
        this.movePieceLogically(this.blackKingSquare,{"file":2,"rank":0});
        this.movePieceLogically({"file":0,"rank":7} , {"file":3,"rank":7});
        this.blackKingSquare = targetSquare; 
    }
    
    //white making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "white" && this.enPassantSquare != null && this.sameSquare(coord2 ,this.enPassantSquare)){
        
    
        //move pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        this.movePieceLogically( {"file":this.enPassantSquare.file,"rank":this.enPassantSquare.rank-1} , this.enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        this.movePieceLogically(coord1,coord2);
  
    }
    
    //black making an en passant move
    else if(toBeMoved.type == "p" && toBeMoved.color == "black" && this.enPassantSquare != null && this.sameSquare(coord2 ,this.enPassantSquare)){
        
        //moves pawn to be caputured onto enPassant square to avoid having the execute move function move the piece
        //moving the piece is best left to seperate functions
        this.movePieceLogically( {"file":this.enPassantSquare.file,"rank":this.enPassantSquare.rank+1} , this.enPassantSquare);
    
        //moves the capturing pawn onto the enPassant square
        this.movePieceLogically(coord1,coord2)
    }
    
    else{
    //move piece normally
    this.movePieceLogically(coord1,coord2)
    }
  
  
  }
        
  movePieceLogically = function(coord1,coord2){
        
        if(this.debug) console.log("moving piece logically");
        
        if(this.sameSquare(coord1,coord2)){
            return;
        }
  
        this.board[coord2.file][coord2.rank] = this.board[coord1.file][coord1.rank];
        let newPiece = this.board[coord2.file][coord2.rank];
  
        newPiece.file = coord2.file;
        newPiece.rank = coord2.rank;
        
        this.board[coord1.file][coord1.rank] = null;
  }
  
  sameSquare = function(coord1,coord2){
    if(coord1 == null || coord2 == null) return false;
    
    return(coord1.rank == coord2.rank && coord1.file == coord2.file)
  }
  
  isLegalMove = function(coord1,coord2){
  
    if(this.sameSquare(coord1,coord2)){
        return false;
    }
  
    let legalMoves = this.legalMovesFor(coord1)
  
    for( let i = 0 ; i < legalMoves.length ; i++ ){
        if(this.sameSquare(legalMoves[i],coord2)){
            return true;
        }
    }
  
    return false;
  }
  
  legalMovesFor = function(coord1){
  
    if(this.board[coord1.file][coord1.rank] == null || this.board[coord1.file][coord1.rank] == undefined) return  new Array(0);
  
    var pieceType = this.board[coord1.file][coord1.rank].type;
    var pieceColor = this.board[coord1.file][coord1.rank].color;
    var pieceFile = coord1.file;
    var pieceRank = coord1.rank;
  
    if(this.whiteToMove && pieceColor == 'black') return new Array(0);
    if(!this.whiteToMove && pieceColor == 'white') return new Array(0);
  
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
                if(pieceColor == 'white' && this.board[knightMoves[i].file][knightMoves[i].rank] != null && this.board[knightMoves[i].file][knightMoves[i].rank].color == 'white' ) continue;
                if(pieceColor == 'black' && this.board[knightMoves[i].file][knightMoves[i].rank] != null && this.board[knightMoves[i].file][knightMoves[i].rank].color == 'black' ) continue;
                result.push(knightMoves[i]);
            }
        }
  
    }break;
  
    //==========================================Pawn==========================================
    case "p":{
        
        let pawnMoves = [];

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
                    if(pawnMoves[i].rank == coord1.rank+1 && pawnMoves[i].file == coord1.file+1 && (this.board[pawnMoves[i].file][pawnMoves[i].rank] != null && this.board[pawnMoves[i].file][pawnMoves[i].rank].color != 'white' || this.sameSquare(pawnMoves[i] ,this.enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    if(pawnMoves[i].rank == coord1.rank+1 && pawnMoves[i].file == coord1.file-1 && (this.board[pawnMoves[i].file][pawnMoves[i].rank] != null && this.board[pawnMoves[i].file][pawnMoves[i].rank].color != 'white' || this.sameSquare(pawnMoves[i] ,this.enPassantSquare))){ 
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    //cannot move backwards
                    if(pawnMoves[i].rank <= coord1.rank) continue
                    //pawn can move two squares only on first move
                    if((pawnMoves[i].rank >= coord1.rank+2 && coord1.rank != 1) || pawnMoves[i].rank >= coord1.rank+3 ) continue;
                    //pawns cannot jump
                    if(pawnMoves[i].rank >= coord1.rank+2 && this.board[coord1.file][coord1.rank+1]!=null) continue;
                    //pawns cannot capture forwards
                    if(coord1.file == pawnMoves[i].file && this.board[pawnMoves[i].file][pawnMoves[i].rank] != null) continue;
                    //ensures pawns stay on file
                    if(pawnMoves[i].file!=coord1.file) continue;
        
                }else{       
                    
                    //checks if a legal capture or enPassant move can be made on either side
                    if(pawnMoves[i].rank == coord1.rank-1 && pawnMoves[i].file == coord1.file+1 && (this.board[pawnMoves[i].file][pawnMoves[i].rank] != null && this.board[pawnMoves[i].file][pawnMoves[i].rank].color != 'black' || this.sameSquare(pawnMoves[i] ,this.enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    if(pawnMoves[i].rank == coord1.rank-1 && pawnMoves[i].file == coord1.file-1 && (this.board[pawnMoves[i].file][pawnMoves[i].rank] != null && this.board[pawnMoves[i].file][pawnMoves[i].rank].color != 'black'|| this.sameSquare(pawnMoves[i] ,this.enPassantSquare))) {
                        result.push(pawnMoves[i]);
                        continue;
                    }
                    //cannot move backwards         
                    if(pawnMoves[i].rank >= coord1.rank) continue;
                    //pawn can move two squares only on first move
                    if((pawnMoves[i].rank <= coord1.rank-2 && coord1.rank != 6) || pawnMoves[i].rank <= coord1.rank-3) continue;
                    //pawns cannot jump
                    if(pawnMoves[i].rank >= coord1.rank-2 && this.board[coord1.file][coord1.rank-1]!=null) continue;
                    //pawns cannot capture forwards
                    if(coord1.file == pawnMoves[i].file && this.board[pawnMoves[i].file][pawnMoves[i].rank] != null) continue;  
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
  
        var i = pieceFile+1
        var j = pieceRank+1
  
        while(i  < 8 && j < 8){
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
  
        while(i  >= 0 && j < 8){
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(this.board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
  
        }
        for(let i = pieceRank-1 ; i >= 0 ; i--){    
            if(this.board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(this.board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
        }
        for(let i = pieceFile+1 ; i < 8 ; i++){
            
            if(this.board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(this.board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }
  
        }
        for(let i = pieceFile-1 ; i >= 0 ; i--){
  
            if(this.board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(this.board[i][pieceRank].color != pieceColor){
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
            if(this.board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(this.board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
  
        }
        for(let i = pieceRank-1 ; i >= 0 ; i--){    
            if(this.board[pieceFile][i]==null){
                result.push({"file":pieceFile,"rank":i})
            }
            else if(this.board[pieceFile][i].color != pieceColor){
                result.push({"file":pieceFile,"rank":i})
                break;
            }else{
                break;
            }
        }
        for(let i = pieceFile+1 ; i < 8 ; i++){
            
            if(this.board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(this.board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }
  
        }
        for(let i = pieceFile-1 ; i >= 0 ; i--){
  
            if(this.board[i][pieceRank]==null){
                result.push({"file":i,"rank":pieceRank})
            }
            else if(this.board[i][pieceRank].color != pieceColor){
                result.push({"file":i,"rank":pieceRank})
                break;
            }else{
                break;
            }
  
        }
  
        let i = pieceFile+1
        let j = pieceRank+1
  
        while(i < 8 && j < 8){
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
            if(this.board[i][j]==null){
                result.push({"file":i,"rank":j})
            }
            else if(this.board[i][j].color != pieceColor){
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
             
            if( kingMoves[i].rank > 7 || kingMoves[i].rank < 0  ||kingMoves[i].file > 7 || kingMoves[i].file < 0  || this.board[kingMoves[i].file][kingMoves[i].rank] != null && this.board[kingMoves[i].file][kingMoves[i].rank].color == pieceColor){
                continue;
            }
            result.push(kingMoves[i]);
        }    
  
        //makes sure that castling rights are respected and prevents castling through check or friendly pieces
        
        //white castling short
        if(this.whiteToMove && this.whiteCanCastleShort && !this.squareInCheckFrom("black",this.whiteKingSquare) && !this.squareInCheckFrom("black",{"file":5,"rank":0}) && this.board[5][0] == null && this.board[6][0] == null )
        {
            result.push({"file":pieceFile+2,"rank":pieceRank})
        }
  
        //white castling long
        if(this.whiteToMove && this.whiteCanCastleLong && !this.squareInCheckFrom("black",this.whiteKingSquare) && !this.squareInCheckFrom("black",{"file":3,"rank":0}) && this.board[1][0] == null && this.board[2][0] == null && this.board[3][0] == null)
        {
            result.push({"file":pieceFile-2,"rank":pieceRank})
        }
  
        //black castling short
        if(!this.whiteToMove && this.blackCanCastleShort && !this.squareInCheckFrom("white",this.blackKingSquare) && !this.squareInCheckFrom("white",{"file":5,"rank":7}) && this.board[5][7] == null && this.board[6][7] == null )
        {
            result.push({"file":pieceFile+2,"rank":pieceRank})
        }
  
        //black castling long
        if(!this.whiteToMove && this.blackCanCastleLong && !this.squareInCheckFrom("white",this.blackKingSquare) && !this.squareInCheckFrom("black",{"file":3,"rank":7}) && this.board[1][7] == null && this.board[2][7] == null && this.board[3][7] == null)
        {
            result.push({"file":pieceFile-2,"rank":pieceRank})
        }
  
    }
  
    }
  
    //checks if the move puts the king in check
    for(var i = result.length-1 ; i >= 0 ; i--){
        if(this.putsKingInCheck(pieceColor , coord1 , result[i])){
            result.splice(i,1);
        }
    }
  
    return result;
  }
  
  putsKingInCheck = function(color,originalSquare,endSquare){
  
    if(this.debug) console.log("checking if the "+color+" king is in put in check by this move");
  
    let result = false;
    
    
    // saves a copy of the original this.board
    const originalBoard = []
    
    const originalDarkKingSquare = this.blackKingSquare
    const originalLightKingSquare = this.whiteKingSquare
    
    for(let i = 0 ; i < 8 ; i++){
        originalBoard[i] = this.board[i].slice()
    }
    
    
    let rank1 = originalSquare.rank
    let file1 = originalSquare.file
    
    let rank2 = endSquare.rank
    let file2 = endSquare.file
    
    if(this.board[file1][rank1].type == "k" && this.board[file1][rank1].color == "white") this.whiteKingSquare = {"file":file2,"rank":rank2};
    if(this.board[file1][rank1].type == "k" && this.board[file1][rank1].color == "black") this.blackKingSquare = {"file":file2,"rank":rank2};
    
    //performs a said move on the game this.board
    
    this.executeMoveLogically({"file":file1,"rank":rank1},{"file":file2,"rank":rank2})
    
    //checks if the move puts the king in check or not
    
    if(color == "white"){
        result = this.squareInCheckFrom("black",this.whiteKingSquare)
    }else{
        result = this.squareInCheckFrom("white",this.blackKingSquare)
    }
    
    //copies this.board back to original state
    
    for(let i = 0 ; i < 8 ; i++){
        this.board[i] = originalBoard[i].slice()
    }
    this.blackKingSquare = originalDarkKingSquare 
    this.whiteKingSquare = originalLightKingSquare
    
    //if(result == true) console.log("the king cannot be in check") 
    
    //return whether a certain move put the king in check
    
    return result;
  }
  
  squareInCheckFrom = function(color , targetSquare){
  
    if(this.debug) console.log("checking if square (" + targetSquare.file+","+targetSquare.rank+") is in check from " + color);
  
  let enemyColor = color;
  let file = targetSquare.file;
  let rank = targetSquare.rank;
  
  
  //Checks attacks by pawns
  
  if(enemyColor == "white"){
    if(file>=1 && rank>=1 &&
        this.board[file-1][rank-1] != null && 
        this.board[file-1][rank-1].type == "p" && 
        this.board[file-1][rank-1].color == enemyColor){return true;}
    if(targetSquare.file<=6 && rank>=1 &&
        this.board[file+1][rank-1] != null && 
        this.board[file+1][rank-1].type == "p" && 
        this.board[file+1][rank-1].color == enemyColor){return true;}
  
  
  }else{
    if(file>=1 && rank<=6 &&
        this.board[file-1][rank+1] != null && 
        this.board[file-1][rank+1].type == "p" && 
        this.board[file-1][rank+1].color == enemyColor){return true;}
    if(targetSquare.file<=6 && rank>=1 &&
        this.board[file+1][rank+1] != null && 
        this.board[file+1][rank+1].type == "p" && 
        this.board[file+1][rank+1].color == enemyColor){return true;}
  }
  
  //Checks for attacks on diagonals
  
  let i = file+1
  let j = rank+1
  
  while(i < 8 && j < 8){
    if(this.board[i][j]==null){
         
    }else if(this.board[i][j].color != enemyColor || ( this.board[i][j].type != "b" && this.board[i][j].type != "q" )){
        break;
    }else if(this.board[i][j].type == "b" || this.board[i][j].type == "q" && this.board[i][j].color == enemyColor){
        {return true;}
    }
    i++;
    j++;
  }
  
  i = file-1
  j = rank+1
  
  while(i >= 0 && j < 8){
    if(this.board[i][j]==null){
         
    }else if(this.board[i][j].color != enemyColor  || ( this.board[i][j].type != "b" && this.board[i][j].type != "q" )){
        break;
    }else if(this.board[i][j].type == "b" || this.board[i][j].type == "q" && this.board[i][j].color == enemyColor){
        {return true;}
    }
    i--;
    j++;
  }
  
  i = file-1
  j = rank-1
  
  while(i >= 0 && j >= 0){
    if(this.board[i][j]==null ){
         
    }else if(this.board[i][j].color != enemyColor  || ( this.board[i][j].type != "b" && this.board[i][j].type != "q" )){
        break;
    }else if(this.board[i][j].type == "b" || this.board[i][j].type == "q" && this.board[i][j].color == enemyColor){
        {return true;}
    }
    i--;
    j--;
  }
  
  i = file+1
  j = rank-1
  
  while(i < 8 && j >= 0){
    if(this.board[i][j]==null ){
         
    }else if(this.board[i][j].color != enemyColor || ( this.board[i][j].type != "b" && this.board[i][j].type != "q" )){
        break;
    }else if(this.board[i][j].type == "b" || this.board[i][j].type == "q" && this.board[i][j].color == enemyColor){
        {return true;}
    }
    i++;
    j--;
  }
  
  //checks for threats on ranks and files
  
  for(let i  = rank+1 ; i < 8 ; i++){
    if(this.board[file][i]==null ){
  
    }
    else if(this.board[file][i].color != enemyColor  || ( this.board[file][i].type != "q" && this.board[file][i].type != "r" )){
        break;
    }else if(this.board[file][i].color == enemyColor && this.board[file][i].type == "q" || this.board[file][i].type == "r") {
        {return true;}
    }

  }
  for(let i  = rank-1 ; i >= 0 ; i--){    
    if(this.board[file][i]==null ){
  
    }
    else if(this.board[file][i].color != enemyColor || ( this.board[file][i].type != "q" && this.board[file][i].type != "r" )){
        break;
    }else if(this.board[file][i].color == enemyColor && this.board[file][i].type == "q" ||this.board[file][i].type == "r") {
        {return true;}
    }
  }
  for(let i  = file+1 ; i < 8 ; i++){
    
    if(this.board[i][rank]==null ){
  
    }
    else if(this.board[i][rank].color != enemyColor || ( this.board[i][rank].type != "q" && this.board[i][rank].type != "r" )){
        break;
    }else if(this.board[i][rank].color == enemyColor && this.board[i][rank].type == "q" ||this.board[i][rank].type == "r") {
        {return true;}
    }
  
  }
  for(let i  = file-1 ; i >= 0 ; i--){
  
    if(this.board[i][rank]==null ){
  
    }
    else if(this.board[i][rank].color != enemyColor || ( this.board[i][rank].type != "q" && this.board[i][rank].type != "r" )){
        break;
    }else if(this.board[i][rank].color == enemyColor && this.board[i][rank].type == "q" || this.board[i][rank].type == "r") {
        {return true;}
    }
  
  }
  
  //checks for threats on knight moves
    if(typeof(this.board[file+1]) != "undefined" && typeof(this.board[file+1][rank+2]) != "undefined" && this.board[file+1][rank+2] != null && this.board[file+1][rank+2].color == enemyColor && this.board[file+1][rank+2].type == "n") return true;
    if(typeof(this.board[file+1]) != "undefined" && typeof(this.board[file+1][rank-2]) != "undefined" && this.board[file+1][rank-2] != null && this.board[file+1][rank-2].color == enemyColor && this.board[file+1][rank-2].type == "n") return true;
    if(typeof(this.board[file+2]) != "undefined" && typeof(this.board[file+2][rank+1]) != "undefined" && this.board[file+2][rank+1] != null && this.board[file+2][rank+1].color == enemyColor && this.board[file+2][rank+1].type == "n") return true;
    if(typeof(this.board[file+2]) != "undefined" && typeof(this.board[file+2][rank-1]) != "undefined" && this.board[file+2][rank-1] != null && this.board[file+2][rank-1].color == enemyColor && this.board[file+2][rank-1].type == "n") return true;
    if(typeof(this.board[file-1]) != "undefined" && typeof(this.board[file-1][rank+2]) != "undefined" && this.board[file-1][rank+2] != null && this.board[file-1][rank+2].color == enemyColor && this.board[file-1][rank+2].type == "n") return true;
    if(typeof(this.board[file-1]) != "undefined" && typeof(this.board[file-1][rank-2]) != "undefined" && this.board[file-1][rank-2] != null && this.board[file-1][rank-2].color == enemyColor && this.board[file-1][rank-2].type == "n") return true;
    if(typeof(this.board[file-2]) != "undefined" && typeof(this.board[file-2][rank+1]) != "undefined" && this.board[file-2][rank+1] != null && this.board[file-2][rank+1].color == enemyColor && this.board[file-2][rank+1].type == "n") return true;
    if(typeof(this.board[file-2]) != "undefined" && typeof(this.board[file-2][rank-1]) != "undefined" && this.board[file-2][rank-1] != null && this.board[file-2][rank-1].color == enemyColor && this.board[file-2][rank-1].type == "n") return true;
  
  //checks for king threats
    if(typeof(this.board[file+1]) != "undefined" && typeof(this.board[file+1][rank+1]) != "undefined" && this.board[file+1][rank+1] != null && this.board[file+1][rank+1].color == enemyColor && this.board[file+1][rank+1].type == "k") return true;
    if(typeof(this.board[file+1]) != "undefined" && typeof(this.board[file+1][rank]) != "undefined" && this.board[file+1][rank] != null && this.board[file+1][rank].color == enemyColor && this.board[file+1][rank].type == "k") return true;
    if(typeof(this.board[file+1]) != "undefined" && typeof(this.board[file+1][rank-1]) != "undefined" && this.board[file+1][rank-1] != null && this.board[file+1][rank-1].color == enemyColor && this.board[file+1][rank-1].type == "k") return true;
    if(typeof(this.board[file]) != "undefined" && typeof(this.board[file][rank-1]) != "undefined" && this.board[file][rank-1] != null && this.board[file][rank-1].color == enemyColor && this.board[file][rank-1].type == "k") return true;
    if(typeof(this.board[file-1]) != "undefined" && typeof(this.board[file-1][rank-1]) != "undefined" && this.board[file-1][rank-1] != null && this.board[file-1][rank-1].color == enemyColor && this.board[file-1][rank-1].type == "k") return true;
    if(typeof(this.board[file-1]) != "undefined" && typeof(this.board[file-1][rank]) != "undefined" && this.board[file-1][rank] != null && this.board[file-1][rank].color == enemyColor && this.board[file-1][rank].type == "k") return true;
    if(typeof(this.board[file-1]) != "undefined" && typeof(this.board[file-1][rank+1]) != "undefined" && this.board[file-1][rank+1] != null && this.board[file-1][rank+1].color == enemyColor && this.board[file-1][rank+1].type == "k") return true;
    if(typeof(this.board[file]) != "undefined" && typeof(this.board[file][rank+1]) != "undefined" && this.board[file][rank+1] != null && this.board[file][rank+1].color == enemyColor && this.board[file][rank+1].type == "k") return true;
  
  return false;
  
  }
  
  //returns an array of all legal moves for one color of pieces
  colorHasLegalMoves = function(color){
  
    if(this.debug) console.log("getting all legal moves for:"+color);
    
    let result = new Array()
    
    for(let i = 0 ; i < 8 ; i++){
        for(let j = 0 ; j < 8 ; j++){
            if(this.board[i][j]!=null && this.board[i][j].color == color){
                this.legalMovesFor({"file":i,"rank":j}).forEach(move => {
                    result.push(move)
                })
            }
        }
    }
    
    return result.length>0
  }
  
  generateFEN = function(){
    let result = ""
    let counter = 0;
  
    for(let i = 7 ; i >=0 ; i--){
        if(i < 7)result += "/"
        for(let j = 0 ; j < 8 ; j++){
            if(this.board[j][i] != null){
                let pieceName = this.board[j][i].type;
                if(this.board[j][i].color == "white") pieceName = pieceName.toUpperCase();
                
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
  
    if(this.whiteToMove){
        result += " w"
    }else{
        result += " b"
    }
  
  
    result += " "
    if(this.whiteCanCastleShort) result += "K";
    if(this.whiteCanCastleLong) result += "Q";
    if(this.blackCanCastleShort) result += "k";
    if(this.blackCanCastleLong) result += "q";
    if(result.substring(result.length-1,result.length) == " ") result += "-"
  
  
    if(this.enPassantSquare == null){
        result += " -"
    }else{
        result += " "+this.alphabet.substring(this.enPassantSquare.file ,this.enPassantSquare.file+1)+(this.enPassantSquare.rank+1);
    }
  
    result += " "+this.halfMoveClock
  
    result += " "+this.fullMoveNumber
  
    return result;
  }
  
  loadFEN = function(FENString){
  
    this.board = new Array(8);
  
    for(let i = 0 ; i < this.board.length; i++){
        this.board[i] = new Array(8);
    }
  
    for(let i = 0 ; i < 8 ; i++){
        for(let j = 0 ; j < 8 ; j++){
            this.board[i][j] = null;
        }   
    }
  
    let file = 0;
    let rank = 7;
    
    for(let i = 0 ; i < FENString.indexOf(" ") ; i++){
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
                this.board[file][rank] = new King("black",file,rank);
                this.blackKingSquare = {"file":file, "rank":rank};
                file++;
            } break;
            case "q":{
                this.board[file][rank] = new Queen("black",file,rank);
                file++;
            } break;
            case "r":{
                this.board[file][rank] = new Rook("black",file,rank);
                file++;
            } break;
            case "b":{
                this.board[file][rank] = new Bishop("black",file,rank);
                file++;
            } break;
            case "n":{
                this.board[file][rank] = new Knight("black",file,rank);
                file++;
            } break;
            case "p":{
                this.board[file][rank] = new Pawn("black",file,rank);
                file++;
            } break;
            case "K":{
                this.board[file][rank] = new King("white",file,rank);
                this.whiteKingSquare = {"file":file, "rank":rank};
                file++;
            } break;
            case "Q":{
                this.board[file][rank] = new Queen("white",file,rank);
                file++;
            } break;
            case "R":{
                this.board[file][rank] = new Rook("white",file,rank);
                file++;
            } break;
            case "B":{
                this.board[file][rank] = new Bishop("white",file,rank);
                file++;
            } break;
            case "N":{
                this.board[file][rank] = new Knight("white",file,rank);
                file++;
            } break;
            case "P":{
                this.board[file][rank] = new Pawn("white",file,rank);
                file++;
            } break;
  
        }
    }
  
    FENString = FENString.substring(FENString.indexOf(" ") + 1);
  
    if(FENString.substring(0,1) == "w"){
        this.whiteToMove = true;
    }
    if(FENString.substring(0,1) == "b"){
        this.whiteToMove = false;
    }
  
    FENString = FENString.substring(FENString.indexOf(" ") + 1);
  
    for(let i = 0 ; i < FENString.indexOf(" ") ; i++){
        switch(FENString.substring(i,i+1)){
            case "k" : {
                this.blackCanCastleShort = true;
            }break;
            case "q" : {
                this.blackCanCastleLong = true;
            }break;
            case "K" : {
                this.whiteCanCastleShort = true;
            }break;
            case "Q" : {
                this.whiteCanCastleLong = true;
            }break;
            case "-" : {
                this.whiteCanCastleLong = false;
                this.whiteCanCastleShort = false;
                this.blackCanCastleLong = false;
                this.blackCanCastleShort = false;
            }break;
  
        }
    }
  
    FENString = FENString.substring(FENString.indexOf(" ") + 1);
  
    if(FENString.substring(0,1) != "-"){
        this.enPassantSquare = {"file":this.alphabet.indexOf(FENString.substring(0,1)) , "rank":parseInt(FENString.substring(1,2)-1)}
    }
  
    FENString = FENString.substring(FENString.indexOf(" ") + 1);
  
    this.halfMoveClock = parseInt(FENString.substring(0,FENString.indexOf(" ")))
  
    FENString = FENString.substring(FENString.indexOf(" ") + 1);
  
    this.fullMoveNumber = parseInt(FENString.substring(0))
  
    // Checks for checkmate
    if(this.squareInCheckFrom("black",this.whiteKingSquare) && !this.colorHasLegalMoves("white") ){
        this.displayVictoryFor("black")
  
    }else if(this.squareInCheckFrom("white",this.blackKingSquare) && !this.colorHasLegalMoves("black") ){
        this.displayVictoryFor("white")
  
    }
  
  }
  
 initializeBoard = function(){
    this.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }
  
  displayVictoryFor = function(color){
  
  }
  
  evaluatePosition = function(FENString){
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

}

