export declare type Observable<S> = any

export declare type Action<A, S> = {
    apply: (state:S) => S
    value: A
}

export declare type Selector = string | number

export declare type Dispatcher<A, S> = (...actions:Array<Observable<A>>) => Observable<Action<A, S>>

export declare type ChildFn<S> = (item:ItemStore<S>, key?:string) => {[name: string]: Observable<any>}

export interface ItemStoreValue<S> extends Observable<S> {
    select:<SC> (selector:Selector) => Store<SC>
}

export interface ArrayStoreValue<S> extends ItemStoreValue<Array<S>> {
    mapChildren: (childFn:ChildFn,
                  eventSinks?:Array<string> = ["Store"],
                  valueSinks?:Array<string> = ["DOM"]) => {[name: string]: Observable<any>}

    mapChildrenById: (keyFn:(item:S) => string, childFn:ChildFn,
                      eventSinks?:Array<string> = ["Store"],
                      valueSinks?:Array<string> = ["DOM"]) => {[name: string]: Observable<any>}
}

export interface StoreActions<S> {
    reduce:<A> (reducer:(state:S, action:A) => S) => Dispatcher<A, S>
}

export declare type ItemStore<S> = {
    value: ItemStoreValue<S>
    actions: StoreActions<S>
}

export declare type ArrayStore<S> = {
    value: ArrayStoreValue<S>
    actions: StoreActions<S>
}

export declare type Store<S> = ItemStore<S> | ArrayStore<S>

export declare type StoreSource<S> = Store<S>

export declare type StoreSink<A, S> = Observable<Action<A, S>>

export default function StoreDriver<A, S>(initialState:S):(actions:StoreSink<A, S>) => StoreSource<S>

