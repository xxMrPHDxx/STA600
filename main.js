let input, output, table;
const columns = {
	Y: [],
	X1: []
};
const rows = [];

let numIndependent = 1;

function onLoad(){
	input = document.querySelector("input#RawInput");
	output = document.querySelector("div#Output");
	table = document.querySelector("table#Data");

	let thead = document.createElement("thead");
	for(let name in columns){
		let td = document.createElement("td");
		td.textContent = name;
		thead.appendChild(td);
	}
	table.appendChild(thead);
}

function initializeTable(){
	let thead = document.createElement("thead");
	for(let name in columns){
		let td = document.createElement("td");
		td.textContent = name;
		thead.appendChild(td);
	}
	table.appendChild(thead);
}

function insertRow(){
	let tr = document.createElement("tr");
	for(let name in columns){
		let td = document.createElement("td");
		let input = document.createElement("input");
		input.setAttribute("class","DataCell");
		td.appendChild(input);
		tr.appendChild(td);
	}
	table.appendChild(tr);
}

function insertColumn(){
	numIndependent++;
	columns["X"+numIndependent] = [];
	table.innerHTML = "";
	initializeTable();
}

function getData(){
	let data = document.querySelectorAll("input.DataCell");
	if(data.length <= 0) return [[]];
	let cols = document.querySelectorAll("table#Data thead td");
	let numcol = cols.length;
	let numrow = (data.length / numcol) | 0;
	let arr = Array(numrow).fill().map(rows => Array(numcol).fill().map(_ => 0));
	for(let row=0;row<numrow;row++){
		for(let col=0;col<numcol;col++){
			let i = row*numcol + col;
			let value = parseFloat(data[i].value);
			if(isNaN(value)) continue;
			arr[row][col] = value;
		}
	}
	return arr;
}

function getDependent(){
	let y = [];
	let data = getData();
	for(let row=0;row<data.length;row++){
		y[row] = data[row][0];
	}
	return Matrix.fromArray(y);
}

function getIndependents(){
	let data = getData();
	for(let row=0;row<data.length;row++){
		data[row] = data[row].splice(1);
	}
	return Matrix.from2DArray(data);
}

function findSum(){
	let Y = getDependent();
	let X = getIndependents();
	let sumY = Y.reduceRow((a,b) => a+b,0);
	let sumX = X.reduceRow((a,b) => a+b,0);

	if(sumY.length == 0 || sumX.length == 0) return;

	let div = document.createElement("div");
	div.setAttribute("class","OutputGroup");

	let title = document.createElement("h3");
	title.textContent = "Sum Square Table";
	div.appendChild(title);

	let t = document.createElement("table");
	t.setAttribute("class","ResultTable");
	let th = document.createElement("thead");
	t.appendChild(th);
	let sumrow = document.createElement("tr");
	t.appendChild(sumrow);

	[...sumY,...sumX].forEach((sum,i) => {
		let name = "Y";
		if(i != 0) name = `X<sub>${i}</sub>`;
		let sigma = "<span class='sigma'>&Sigma;</span>";
		let title = sigma + name;

		let headTD = document.createElement("td");
		headTD.innerHTML = title;
		th.appendChild(headTD);
		let valueTD = document.createElement("td");
		valueTD.textContent = sum;
		sumrow.appendChild(valueTD);
	});

	div.appendChild(t);

	output.appendChild(div);
}

function findSumSquare(){
	let Y = getDependent();
	let X = getIndependents();
	let sumY = Y.reduceRow((a,b) => a+Math.pow(b,2),0);
	let sumX = X.reduceRow((a,b) => a+Math.pow(b,2),0);

	if(sumY.length == 0 || sumX.length == 0) return;

	let div = document.createElement("div");
	div.setAttribute("class","OutputGroup");

	let title = document.createElement("h3");
	title.textContent = "Sum Square Table";
	div.appendChild(title);

	let t = document.createElement("table");
	t.setAttribute("class","ResultTable");
	let th = document.createElement("thead");
	t.appendChild(th);
	let sumrow = document.createElement("tr");
	t.appendChild(sumrow);

	[...sumY,...sumX].forEach((sum,i) => {
		let name = "Y";
		if(i != 0) name = `X<sup>2</sup><sub>${i}</sub>`;
		let sigma = "<span class='sigma'>&Sigma;</span>";
		let title = sigma + name;

		let headTD = document.createElement("td");
		headTD.innerHTML = title;
		th.appendChild(headTD);
		let valueTD = document.createElement("td");
		valueTD.textContent = sum;
		sumrow.appendChild(valueTD);
	});

	div.appendChild(t);

	output.appendChild(div);
}

function findSumSquareCorrelated(){
	let Y = getDependent();
	let X = getIndependents();

	if(Y.isEmpty() || X.isEmpty()) return;

	let div = document.createElement("div");
	div.setAttribute("class","OutputGroup");

	let title = document.createElement("h3");
	title.textContent = "Sum Square Correlated Table";
	div.appendChild(title);

	let t = document.createElement("table");
	t.setAttribute("class","ResultTable");
	let th = document.createElement("thead");
	t.appendChild(th);
	let sumrow = document.createElement("tr");
	t.appendChild(sumrow);

	let XX = Matrix.mult(Matrix.transpose(X),X);
	for(let i=0;i<XX.row;i++){
		for(let j=i;j<XX.col;j++){
			let name = (i !== j ? `X<sub>${i+1}</sub>X<sub>${j+1}</sub>` : `X<sub>${i+1}</sub><sup>2</sup>`);
			let sigma = "<span class='sigma'>&Sigma;</span>";
			let title = sigma + name;

			let headTD = document.createElement("td");
			headTD.innerHTML = title;
			th.appendChild(headTD);
			let valueTD = document.createElement("td");
			valueTD.textContent = XX.cell[i][j];
			sumrow.appendChild(valueTD);
		}
	}

	div.appendChild(t);

	output.appendChild(div);
}

function findBeta(){
	let Y = getDependent();
	let x = getIndependents();

	let X = new Matrix(x.row,x.col+1);
	X.map((_,row,col)=>{
		return (col == 0) ? 1 : x.cell[row][col-1];
	});

	let XX = Matrix.mult(Matrix.transpose(X),X);
	let XY = Matrix.mult(Matrix.transpose(X),Y);

	let a
	try{
		a = Matrix.inverse(XX);
	}catch(e){
		alert(e.message);
		return;
	}

	let beta = Matrix.mult(a,XY);

	let div = document.createElement("div");
	div.setAttribute("class","OutputGroup");

	let title = document.createElement("h3");
	title.textContent = "Coefficient Table";
	div.appendChild(title);

	let t = document.createElement("table");
	t.setAttribute("class","ResultTable");
	let th = document.createElement("thead");
	t.appendChild(th);
	let sumrow = document.createElement("tr");
	t.appendChild(sumrow);

	for(let i=0;i<beta.row;i++){
		let j=0;
		let name = `<sub>${i}</sub>`;
		let title = "<span class='beta'>&Beta;</span>" + name;

		let headTD = document.createElement("td");
		headTD.innerHTML = title;
		th.appendChild(headTD);
		let valueTD = document.createElement("td");
		valueTD.textContent = beta.cell[i][j];
		sumrow.appendChild(valueTD);
	}

	div.appendChild(t);

	output.appendChild(div);
}