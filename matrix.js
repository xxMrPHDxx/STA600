class Matrix {
	constructor(row=0,col=0){
		this.row = row;
		this.col = col;
		this.cell = Array(row).fill().map(rows => Array(col).fill().map(_=>0));
	}
	forEach(callback){
		for(let row=0;row<this.row;row++){
			for(let col=0;col<this.col;col++){
				callback(this.cell[row][col],row,col,this.cell);
			}
		}
	}
	map(callback){
		this.forEach((cell,row,col,arr) => {
			this.cell[row][col] = callback(cell,row,col,arr);
		});
	}
	reduceRow(callback,start=""){
		let cols = Array(this.col).fill().map(_=>null);
		this.forEach((cell,row,col)=>{
			if(row == 0) {
				cols[col] = callback(start,this.cell[row][col],row);
				return;
			}
			cols[col] = callback(cols[col],this.cell[row][col],row);
		});
		return cols;
	}
	isEmpty(){
		return this.row == 0 || this.col == 0;
	}
	static add(a,b){
		if(!(a instanceof Matrix && b instanceof Matrix)) throw new Error("Invalid arguments! Must pass two Matrix object");
		if(!(a instanceof Matrix && b instanceof Matrix) || a.row != b.row || a.col != b.col) throw new Error("Invalid dimension! Both matrix must have same dimension");
		let ans = new Matrix(a.row,a.col);
		ans.map((_,row,col) => a.cell[row][col] + b.cell[row][col]);
		return ans;
	}
	static sub(a,b){
		if(!(a instanceof Matrix && b instanceof Matrix)) throw new Error("Invalid arguments! Must pass two Matrix object");
		if(!(a instanceof Matrix && b instanceof Matrix) || a.row != b.row || a.col != b.col) throw new Error("Invalid dimension! Both matrix must have same dimension");
		let ans = new Matrix(a.row,a.col);
		ans.map((_,row,col) => a.cell[row][col] - b.cell[row][col]);
		return ans;
	}
	static mult(a,b){
		if(!(a instanceof Matrix && b instanceof Matrix) || a.col != b.row) throw new Error("Invalid operation!");
		let ans = new Matrix(a.row,b.col);
		for(let row=0;row<ans.row;row++){
			for(let col=0;col<ans.col;col++){
				let sum = 0;
				for(let k=0;k<a.col;k++){
					sum += a.cell[row][k] * b.cell[k][col];
				}
				ans.cell[row][col] = sum;
			}
		}
		return ans;
	}
	static det(m){
		if(!(m instanceof Matrix)) throw new Error("Invalid Argument! Argument 1 must be a matrix");
		if(m.row != m.col) throw new Error("Invalid operation! The matrix doesn't have a determinant");
		if(m.row == 2 && m.col == 2){
			let [a,b,c,d] = [].concat.apply([],m.cell);
			return a*d - b*c;
		}

		let det=0;
		for(let col=0;col<m.col;col++){
			let sign = col % 2 == 0 ? 1 : -1;
			let temp = new Matrix(m.row-1,m.col-1);
			temp.map((_,r,c) => {
				let row = r+1;
				let cc = c < col ? c : c+1;
				return m.cell[row][cc];
			});
			let d = Matrix.det(temp);
			det += sign * m.cell[0][col] * d;
		}
		return det;
	}
	static cofactor(m){
		if(!(m instanceof Matrix)) throw new Error("Invalid Argument! Argument 1 must be a matrix");
		if(m.row != m.col) throw new Error("Invalid operation! The matrix doesn't have an cofactor");
		if(m.row === 2 && m.col === 2){
			let matrix = new Matrix(m.row,m.col);
			let [a,b,c,d] = [].concat.apply([],m.cell);
			matrix.cell = [
				[d,-c],
				[-b,a]
			];
			return matrix;
		}
		let ret = new Matrix(m.row,m.col);
		ret.map((_,row,col)=>{
			let temp = new Matrix(m.row-1,m.col-1);
			temp.map((_,r,c) => {
				let rr = r < row ? r : r+1;
				let cc = c < col ? c : c+1;
				return m.cell[rr][cc];
			});
			return Matrix.det(temp);
		});
		return ret;
	}
	static inverse(m){
		if(!(m instanceof Matrix)) throw new Error("Invalid Argument! Argument 1 must be a matrix");
		let inv = Matrix.cofactor(m);

		let temp = new Matrix(inv.row,inv.col);
		temp.map((_,i,j)=>inv.cell[i][j]);
		console.log(temp);

		let det = Matrix.det(m);
		if(m.row != m.col || det == 0) throw new Error("Invalid operation! The matrix doesn't have an inverse");
		inv.map(cell=>{
			return cell/det;
		});
		return inv;
	}
	static fromArray(arr){
		if(!(arr instanceof Array)) return new Matrix();
		let m = new Matrix(arr.length,1);
		m.map((cell,row,col) => {
			if(isNaN(arr[row])) return;
			return arr[row];
		});
		return m;
	}
	static from2DArray(arr){
		if(!(arr instanceof Array && arr[0] instanceof Array)) return new Matrix();
		try{
			let maxCol = -Infinity;
			for(let i=0;i<arr.length;i++){
				if(arr[i].length > maxCol) maxCol = arr[i].length;
			}
			let ret = new Matrix(arr.length, maxCol);
			for(let i=0;i<arr.length;i++){
				for(let j=0;j<arr[i].length;j++){
					ret.cell[i][j] = (!isNaN(arr[i][j]) ? arr[i][j] : 0);
				}
			}
			return ret;
		}catch(ex){
			return new Matrix();
		}
	}
	static transpose(m){
		let ans = new Matrix(m.col,m.row);
		ans.map((cell,row,col)=>{
			return m.cell[col][row];
		});
		return ans;
	}
}