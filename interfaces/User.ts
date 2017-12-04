export enum State { Pending, Activated};


export class User {
    username: string;
    password: string;
    email: string;
    firstname: string;
    lastname: string;
    state : State;
}