export declare enum UserState {
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
    state: UserState;
}
