export declare type Observable<S> = any

export default function <S>(initialState:S):(actions:StoreSink<S>) => StoreSource<S>

export declare type StoreSource<S> = ItemSource<S> | ArraySource<S>

export declare type StoreSink<S> = Observable<Action<any>>


export declare type ItemSource<S> = {
    value: ItemStoreValue<S>
    actions: StoreActions<S>
}

export declare type ArraySource<S> = {
    value: ArrayStoreValue<S>
    actions: StoreActions<Array<S>>
}

export interface ItemStoreValue<S> {
    select:<SC> (selector:Selector) => StoreSource<SC>
}

export interface ArrayStoreValue<S> extends ItemStoreValue<Array<S>> {
    mapChildren: (childFn:ChildFn<S>, sinkSpec:SinkSpec) => ExtractedSinks

    mapChildrenBy: (keyFn:KeyFn<S>, childFn:ChildFn<S>, sinkSpec:SinkSpec) => ExtractedSinks
}

export interface StoreActions<S> {
    reduce: (reducer:(state:S, action:any) => S) => DispatchFn<S>
}

export declare type Selector = string | number

export declare type Action<S> = {
    apply: (state:S) => S
    value: any
}

export declare type DispatchFn<S> = (...actions:Array<Observable<any>>) => Observable<Action<S>>

export declare type ChildFn<S> = (item:ItemSource<S>, key?:string) => {[name: string]: Observable<any>}

export declare type KeyFn<S> = (item:S) => string

export declare type SinkSpec = {
    events?: Array<string>,
    values?: Array<string>
}

export declare type ExtractedSinks = {[name: string]: Observable<any>}
