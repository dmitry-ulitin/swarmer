import { Account } from '../models/account';

export interface State {
    accounts: Account[],
    selected: Account
}

export const initialState: State = {
    accounts: [],
    selected: null
};

export function reducer(state: State = initialState, action: any): State {
    switch(action.type) {        
        case '[accounts] query success' : {
            let accounts = (action.payload as Account[]).map(a => { return {...a, balance: a.start_balance};})
            return {...state, accounts: accounts, selected: null};
        }
        case '[accounts] select': {
            return {...state, selected: action.payload};
        }
        case '[account] query id success':
        case '[account] save success': {
            let selected = action.payload;
            let accounts = [...state.accounts];
            let index = accounts.findIndex(a => a.id == selected.id);
            if (index<0) {
                accounts.push(selected);
            } else {
                accounts[index] = selected;
            }
            selected.balance = selected.start_balance;
            return {...state, accounts: accounts, selected: selected};
        }
        case '[accounts] delete success': {
            let accounts = [...state.accounts];
            let index = accounts.findIndex(a => a.id == state.selected.id);
            if (index>=0) {
                accounts.splice(index, 1);
            } 
            return {...state, accounts: accounts, selected: null};
        }
        default: {
            return state;
        }
    }
}