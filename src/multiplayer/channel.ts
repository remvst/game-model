import { Observable } from "rxjs"

export interface Channel<T> {
    incoming(): Observable<T>;
    send(message: T): void;
}