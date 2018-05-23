export declare enum State {
    Pending = 0,
    Activated = 1,
}
export declare class User {
    userID: string;
    username: string;
    password: string;
    email: string;
    firstname: string;
    lastname: string;
    state: State;
}
