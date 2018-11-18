import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../models/account';
import { Category } from '../models/category';
//import { Transaction } from '../models/transaction';

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction.form.component.html',
    styles: []
})
export class TransactionFormComponent implements OnInit, OnChanges {
    @Input('data') data: any;
    @Input('accounts') accounts: Account[];
    @Input('expenses') expenses: Category[];
    @Input('income') income: Category[];
    @Output('submit')
    submit = new EventEmitter<any>();

    types = ['Transfer', 'Expense', 'Income'];
    categories:Category[] = [];
    add_category = false;
    form: FormGroup;
    constructor(private location: Location, private fb: FormBuilder) {
        this.form = this.fb.group({
            id: [],
            type: [0],
            tamount: ['', Validators.required],
            tcurrency: ['', Validators.required],
            camount: ['', Validators.required],
            ccurrency: ['', Validators.required],
            account: [],
            recipient: [],
            category: [],
            cname: [],
            opdate: [new Date().toISOString().substr(0, 10), Validators.required],
            details: []
        });
    }
    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (changes.data && changes.data.currentValue && changes.data.currentValue.id) {
            this.form.patchValue(changes.data.currentValue);
            this.setCategory(changes.data.currentValue.category);
            this.setAccount(changes.data.currentValue.account);
            this.setRecipient(changes.data.currentValue.recipient);
        }
        let data = this.form.value;
        if (this.accounts && this.accounts.length && !data.account && !data.recipient) {
            data.account = this.accounts[0];
            this.setAccount(data.account);
        }
        if (data.account  || data.recipient) {
            let type = data.account && data.recipient ? 0 : (data.account ? 1 : 2);
            this.setType(type);
        }
    }

    setType(type: number) {
        let change = this.form.controls.type.value != type;
        this.form.controls.type.setValue(type);
        let acc = this.form.controls.account.value;
        let rec = this.form.controls.recipient.value;
        if (type == 0) {
            this.setAccount(acc || rec);
            this.setRecipient(rec || acc);
            this.categories = [];
        }
        else if (type == 1) {
            this.setAccount(acc || rec);
            this.setRecipient(null);
            this.categories = this.expenses || [];
        }
        else if (type == 2) {
            this.setAccount(null);
            this.setRecipient(rec || acc);
            this.categories = this.income || [];
        }
        if (change) {
            this.setCategory(this.categories.length ? this.categories[0] : null);
        }
    }

    setAccount(a: Account) {
        this.form.controls.account.setValue(a);
        if (a) {
            this.form.controls.tcurrency.setValue(a.currency)
            if (this.form.controls.recipient.value == a) {
                this.form.controls.recipient.setValue(this.accounts.filter(item => item != a)[0]);
            }
        }
    }

    setRecipient(a: Account) {
        this.form.controls.recipient.setValue(a);
        if (a) {
            this.form.controls.tcurrency.setValue(a.currency)
            if (this.form.controls.account.value == a) {
                this.form.controls.account.setValue(this.accounts.filter(item => item != a)[0]);
            }
        }
    }

    setCategory(c: Category) {
        this.form.controls.category.setValue(c);
    }

    isConverted() {
        return false;
    }

    onSubmit({ value, valid }) {
        this.submit.emit(value);
    }

    cancel() {
        this.location.back();
    }
}