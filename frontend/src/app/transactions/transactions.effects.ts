import { Injectable } from "@angular/core";
import { Router } from '@angular/router'
import { Observable, of } from 'rxjs';
import { switchMap, map, withLatestFrom, filter, tap, catchError } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { BackendService } from '../backend.service'
import { AlertifyService } from '../alertify.service'

@Injectable()
export class TransactionsEffects {
    constructor(private actions$: Actions<any>,
        private store: Store<State>,
        private backend: BackendService,
        private notify: AlertifyService,
        private router: Router) { };

    @Effect() getTransactions$: Observable<any> = this.actions$.ofType('[transactions] query').pipe(
        switchMap(action => this.backend.getTransactions().pipe(
            map(data => { return { type: '[transactions] query success', payload: data }; }),
            catchError(error => of({ type: '[transactions] query fail', payload: error }))
        ))
    );

    @Effect() getTransaction$: Observable<any> = this.actions$.ofType('[transaction] query id').pipe(
        switchMap(action => this.backend.getTransaction(action.payload).pipe(
            map(data => { return { type: '[transaction] query id success', payload: data }; }),
            catchError(error => of({ type: '[transaction] query id fail', payload: error }))
        ))
    );

    @Effect() createTransaction$: Observable<any> = this.actions$.ofType('[transactions] create').pipe(
        withLatestFrom(this.store),
        map(([action, state]) => {
            if (state.accounts.selected) {
                action.payload.account = action.payload.ttype == 1 ? null : state.accounts.selected;
                action.payload.recipient = action.payload.ttype == 2 ? null : state.accounts.selected;
            }
            this.router.navigate(['/transactions/create']);
            return { type: '[transactions] select', payload: action.payload };
        })
    );

    @Effect() saveTransaction$: Observable<any> = this.actions$.ofType('[transaction] save').pipe(
        switchMap(action => this.backend.saveTransaction(action.payload).pipe(
            map(data => {
                this.notify.success('Transaction saved');
                this.router.navigate(['/transactions']);
                return { type: '[transaction] save success', payload: data };
            }),
            catchError(error => of({ type: '[transactions] save fail', payload: error }))
        ))
    );

    @Effect() deleteTransaction$: Observable<any> = this.actions$.ofType('[transactions] delete').pipe(
        withLatestFrom(this.store),
        filter(([action, state]) => state.transactions.selected != null),
        switchMap(([action, state]) => this.notify.confirm('Delete transaction #' + state.transactions.selected.id + '?').pipe(
            filter(c => c),
            switchMap(() => this.backend.deleteTransaction(state.transactions.selected.id).pipe(
                map(data => {
                    this.notify.success('Transaction removed');
                    this.router.navigate(['/transactions']);
                    return { type: '[transactions] delete success' };
                })
            )),
            catchError(error => of({ type: '[transactions] delete fail', payload: error }))
        ))
    );
}