let Modal = {
	btnPlus: document.querySelector('#btnPlus'),
	btnCancel: document.querySelector('#btnCancel'),

	toggleModal(){
		document.querySelector('.modal-overlay').classList.toggle('active');
	}
}

let DOM = {
	transactionsContainer: document.querySelector('.data-table tbody'),

	updateBalance(){
		document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
		document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
		document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
	},

	addTransaction(transaction, index){
		let tr = document.createElement('tr');

		tr.innerHTML = this.innerHTMLTransaction(transaction, index);
		tr.dataset.index = index;

		this.transactionsContainer.appendChild(tr);
	},

	innerHTMLTransaction(transaction, index){
		let cssClass = transaction.amount > 0 ? 'income' : 'expense';
		let amount = Utils.formatCurrency(transaction.amount);
		let html = `
			<td data-label="Descrição" class="description">${transaction.description}</td>
			<td data-label="Valor" class="${cssClass}">${amount}</td>
			<td data-label="Data" class="date">${transaction.date}</td>
			<td><img onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Ícone"/></td>
		`;

		return html;
	},

	clearTransactions(){
		this.transactionsContainer.innerHTML = '';
	},
}

let Storage = {
	get(){
		return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
	},

	set(transactions){
		localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
	}
}

let Transaction = {
	all: Storage.get(),

	add(transaction){
		this.all.push(transaction);
		App.reload();
	},
	
	remove(index){
		this.all.splice(index, 1);
		App.reload();
	},

	incomes(){
		let income = 0;

		this.all.reduce((acc, curr) => {
			curr.amount > 0 ? income += curr.amount : '';
		}, 0);
		return income;
	},
	
	expenses(){
		let expense = 0;

		Transaction.all.reduce((acc, curr) => {
			curr.amount < 0 ? expense += curr.amount : '';
		}, 0);
		return expense;
	},

	total(){
		return Transaction.incomes() + Transaction.expenses();
	}
}

let Utils = {
	formatAmount(value){
		value = value * 100;
		return Math.round(value);
	},

	formatDate(txtDate){
		let splittedDate = txtDate.split('-');

		return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
	},

	formatCurrency(value){
		let signal = Number(value) < 0 ? '-' : '';
		let regexpDig = /[\D]/g;

		value = String(value).replace(regexpDig, '');
		value = Number(value) / 100;
		value = value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

		return signal + value;
	},
}

let Form = {
	txtDescription: document.querySelector('#txtDescription'),
	txtAmount: document.querySelector('#txtAmount'),
	txtDate: document.querySelector('#txtDate'),

	getValues(){
		return {
			txtDescription: this.txtDescription.value,
			txtAmount: this.txtAmount.value,
			txtDate: this.txtDate.value,
		}
	},

	validateFields(){
		let {txtDescription, txtAmount, txtDate} = this.getValues();

		if(txtDescription.trim() === "" || txtAmount.trim() === "" || txtDate.trim() === ""){
			throw new Error("Por favor, preencha todos os campos!");
		}
	},
	
	formatValues(){
		let {txtDescription, txtAmount, txtDate} = this.getValues();

		txtAmount = Utils.formatAmount(txtAmount);
		txtDate = Utils.formatDate(txtDate);

		return {
			description: txtDescription,
			amount: txtAmount,
			date: txtDate,
		}
	},
	
	clearFields(){
		this.txtDescription.value = "";
		this.txtAmount.value = "";
		this.txtDate.value = "";
	},

	submit(event){
		event.preventDefault();

		try {
			this.validateFields();

			let transaction = this.formatValues();
			
			Transaction.add(transaction);

			this.clearFields();
			
			Modal.toggleModal();

		} catch (error){
			alert(error.message);
		}
	},
}

let App = {
	init(){
		Modal.btnPlus.addEventListener('click', Modal.toggleModal);
		Modal.btnCancel.addEventListener('click', Modal.toggleModal);

		Transaction.all.forEach((transaction, index) => {
			DOM.addTransaction(transaction, index);
		});

		DOM.updateBalance();
		Storage.set(Transaction.all);
	},

	reload(){
		DOM.clearTransactions();
		App.init();
	},
}

App.init();
let dateFooter = document.querySelector('span#dateFooter');
let date = new Date();
let year = date.getFullYear();
dateFooter.innerHTML = year;
