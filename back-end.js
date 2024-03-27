//I love doing this, this is my unique fingerprint
let doc = document;

let binary = doc.querySelector(".Binary");
let decimal = doc.querySelector(".Decimal");
let selector = doc.querySelector("#operation");
let errText = doc.querySelector("#errText");
let output = doc.querySelector(".output");

//This function will change the operation shown on the site
selector.addEventListener('change', function() {
	if(selector.value == "BI"){
		binary.style.display="block";
		decimal.style.display="none";
	}
	else{
		binary.style.display="none";
		decimal.style.display="block";
	}
	output.style.display="none";
	errText.style.display="none";
});

let bMantissa = doc.querySelector("#bMantissa");
let bExp = doc.querySelector("#bExp");
let dMantissa = doc.querySelector("#dMantissa");
let dExp = doc.querySelector("#dExp");

let binaryOut = doc.querySelector("#binaryOutText");
let hexOut = doc.querySelector("#hexOutText");

let convert = doc.querySelector("#convert");

//flag variable is for when there's an error in the input
let out = { binary:"default", hex:"default", flag:false}

//This function will detect if the convert button has been pressed, and will do the correct process
convert.addEventListener('click', function() {
	if(selector.value == "BI"){
		[out.binary, out.hex, out.flag] = binaryConvert(bMantissa.value, bExp.value);
	}
	else{
		[out.binary, out.hex, out.flag] = decimalConvert(dMantissa.value, dExp.value);
	}
	
	//binary is 
	//1 sign
	//5 exp: +15 bias
	//10 fraction
	//1 00000 1111111111
	
	//hex is 4 characters
	
	if(out.flag == false){
		errText.style.display="none"
		binaryOut.innerHTML=out.binary;
		hexOut.innerHTML=out.hex;
		output.style.display="block";
	}
	else{
		output.style.display="none";
	}
});

doc.addEventListener('keyup', function(x) { //make the convert button work with enter key
	if(x.keyCode == 13){
		convert.click();
	}
});

//========================================BINARY CONVERT
function binaryConvert(m, e){	
	let b = "0 "; //default positive sign bit
	let expChange = 0;
	let f = false;
		
	if(binaryMantissaErrorCheck(m) && binaryExpErrorCheck(e)){
		if(m < 0){ //negative sign bit;
			b = "1 ";
		}
		m = m.replace(/[-+]/g,"");
		[ m, expChange ]= normalize(m);
		
		//we need to check if we're missing digits, if so, figure out if sign or zero extend or trailing zero
		//We will use trailing zero for now
		m = extendTrailingZeros(m, 11); //Mantissa should only have 1 - 11 bits including MSb
		
		
		e = parseInt(e, 10) + 15 + expChange;
		e = decimalToBinary(e, 5);	
		b = b + e + " ";
		//check here if the exponent is a special case; Do we need this? This is for converting it back, not converting it to binary-16
		/*
		if(arrayEquals(e, [1,1,1,1,1]){
			if(m, [0,0,0,0,0,0,0,0,0,0]){
				//Infinity
			}
			else{
				//NaN (quiet/signaling)
			}
		}*/
		m = m.replace(/1\./g,"");
		b = b + m; //10 bits
		f = false;
	}
	else{
		f = true;
	}
	return [ b, toHex(b), f ];
}

//========================================DECIMAL CONVERT
function decimalConvert(m, e){
	let b = "0 "; //default positive sign bit
	let f = false;
		
	if(decimalMantissaErrorCheck(m) && decimalExpErrorCheck(e)){
		//we need to check if we're missing digits, if so, figure out if sign or zero extend, or trailing zero
		//Add code here for that
		if(m < 0){ //negative sign bit
			b = "1 ";
		}
		f = false;
	}
	else{
		f = true;
	}
	return [ b, toHex(b), f ];
}

//========================================ERROR CHECKS
function binaryMantissaErrorCheck(m){ //Binary Mantissa
	//What are the errors with the mantissa?
	//Null input
	if(m == undefined || m == ""){
		showError("Mantissa is empty!");
	}
	//Not a number
	else if(m.replace(/\.|[-+]/g, "1").match(/\D/g)){
		showError("Mantissa is not a number!");
	}
	//Too many digits?
	//disregard sign and dot
	else if(m.replace(/\.|[-+]/g, "").length > 11){
		showError("Mantissa is too long!");
	}
	//Too many dots or sign symbols
	else if(m.split(".").length > 2 || m.split("+").length > 2 || m.split("-").length > 2 || m.match(/[+-]|[-+]/g)){
		showError("Invalid format!");
	}
	else{
		return true;
	}
	return false;
}

function binaryExpErrorCheck(e){ //Binary Exp
	//What are the errors with the exponent?
	//Null input
	if(e == undefined || e == ""){
		showError("Exponent is empty!");
	}
	//Not a number
	else if(isNaN(e)){
		showError("Exponent is not a number!");
	}
	//out of range
	//console.log(error message);
	else{
		return true;
	}
	return false;
}

function decimalMantissaErrorCheck(m){ //Decimal Mantissa
	//What are the errors with the mantissa?
	//Null input
	if(m == undefined || m == ""){
		showError("Mantissa is empty!");
	}
	//Not a number
	else if(isNaN(m)){
		showError("Mantissa is not a number!");
	}
	//Too many digits?
	//console.log(error message);
	else{
		return true;
	}
	return false;
}

function decimalExpErrorCheck(e){ //Decimal Exp
	//What are the errors with the mantissa?
	//Null input
	if(e == undefined || e == ""){
		showError("Exponent is empty!");
	}
	//Not a number
	else if(isNaN(e)){
		showError("Exponent is not a number!");
	}
	//out of range
	//console.log(error message);
	else{
		return true;
	}
	return false;
}

//======================================= HELPER FUNCS
//Function for showing the error message on the site
function showError(s){
	errText.innerHTML=s;
	errText.style.display="block";
}

function toHex(b){
	//Remove all spaces from the binary string
	b = b.replace(/ /g, "");
	/*
	let missingLength = 3 - (b.length%4); //this shouldn't be required, but I'll make it for testing
	for(let i = 0; i <= missingLength; i++){
		b = "0" + b;
	}
	console.log("b after extend: " + b);*/
	//Divide into 4 and convert to hex
	let segments = b.length/4;

	let h = "";
	for(let i = segments; i > 0; i--){
		let nibble = [ b[(i*4)-4], b[(i*4)-3], b[(i*4)-2], b[(i*4)-1] ];
		if(arrayEquals(nibble,[0,0,0,0])){
			h = "0" + h;
		}
		else if(arrayEquals(nibble,[0,0,0,1])){
			h = "1" + h;
		}
		else if(arrayEquals(nibble,[0,0,1,0])){
			h = "2" + h;
		}
		else if(arrayEquals(nibble,[0,0,1,1])){
			h = "3" + h;
		}
		else if(arrayEquals(nibble,[0,1,0,0])){
			h = "4" + h;
		}
		else if(arrayEquals(nibble,[0,1,0,1])){
			h = "5" + h;
		}
		else if(arrayEquals(nibble,[0,1,1,0])){
			h = "6" + h;
		}
		else if(arrayEquals(nibble,[0,1,1,1])){
			h = "7" + h;
		}
		else if(arrayEquals(nibble,[1,0,0,0])){
			h = "8" + h;
		}
		else if(arrayEquals(nibble,[1,0,0,1])){
			h = "9" + h;
		}
		else if(arrayEquals(nibble,[1,0,1,0])){
			h = "A" + h;
		}
		else if(arrayEquals(nibble,[1,0,1,1])){
			h = "B" + h;
		}
		else if(arrayEquals(nibble,[1,1,0,0])){
			h = "C" + h;
		}
		else if(arrayEquals(nibble,[1,1,0,1])){
			h = "D" + h;
		}
		else if(arrayEquals(nibble,[1,1,1,0])){
			h = "E" + h;
		}
		else{
			h = "F" + h;
		}
	}
	return h;
}

function arrayEquals(a, b){
	if (a.length != b.length){
		console.log("Error: Arrays must be same length!");
	}
	else{
		for(let i = 0; i < a.length; i++){
			if (a[i] != b[i]){
				return false;
			}
		}
		return true;
	}
}

function binaryToDecimal(b){
	if (typeof b != "string"){
		console.log("toDecimal function: expected string parameter, got " + typeof b);
		return -1;
	}
	let decimal = 0;
	for(let i = b.length-1, k = 0; i >= 0; i--, k++){
		decimal += b[i] * (2**k);
	}
	return decimal;
}

function decimalToBinary(d, n = 5){
	if (typeof d != "number"){
		console.log("toBinary function: expected number parameter, got " + typeof b);
		return -1;
	}
	let binary = "";
	while(d > 0){
		binary = d%2 + binary;
		d = Math.floor(d/2);
	}
	if (binary.length < n){
		for(let i = binary.length; i < n; i++){
			binary = "0" + binary;
		}
	}
	return binary;
}

//This function will extend it with trailing zero up to n number of digits. Will not do anything n is smaller.
function extendTrailingZeros(m, n){
	if (typeof m != "string"){
		console.log("extendTrailingZeros function: expected string parameter, got " + typeof m);
		return -1;
	}
	//check if has dot, because dot shouldn't be counted in length; m.length - 1 
	let length = m.length;
	if (m.indexOf('.') != -1){;
		length -= 1;
	}
	for(let i = length; i < n ; i++){
		m = m + "0";
	} 
	return m;
}

//will normalize this to x.xxxx... format but will not change the amount of digits
function normalize(m){
	//check if it has dot, because if it does, we only need to move it.
	let dotIndex = m.indexOf('.');
	if (dotIndex == 1){;
		if(m[0] == "0"){
			//leading zero, normalized should [non-zero].xxx
			return leadingDigitsNormalize(m, dotIndex);
		}
		else{
			return [m, 0] //already normalized
		}
	}
	else if(dotIndex == 0){ //starts with dot, so just add a leading 1 to the mantissa? or is it AN ERROR?
		return ["1" + m, 0];
	}
	else if (dotIndex == -1){
		if(m[0] == "0"){ //Leading Zeros; We actually don't know what to do here! Do we truncate or what? e.x. 000101 -> 1.01?
			//return leadingDigitsNormalize(m, dotIndex);
			//truncate for now
			m = m.replace(/0+(1\d*)/g,"$1");
		}
		return [m[0] + '.' + m.substring(1, m.length), m.length - 1] //just add a dot after MSb
	}
	else{ //dot is in the middle and needs to be moved
		
		//check if dot has a 1 to it's left.
		let oneIndex = m.indexOf('1');
		if(oneIndex != -1 && oneIndex < m.indexOf('.')){
			m = m.replace(/\./g, "");
			return [m[oneIndex] + '.' + m.substring(oneIndex + 1, m.length), dotIndex - (oneIndex + 1)]
		}
		//this will move it to right
		return leadingDigitsNormalize(m, dotIndex);
		
	}
}

function leadingDigitsNormalize(m, d){
	let i = 0;
	do{
		i += 1;		
		if (i > m.length){
			i = -1;
			break;
		}
	}while(m[i] == "0" || m[i] == '.');
	return [m[i] + '.' + m.substring(i+1, m.length), (i-d)*(-1)]
}