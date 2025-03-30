export interface UserState {
    email: string;
    id: string;
    name: string;
}

export interface UserActions {
    login: (userData: UserState) => void;
    logOut: () => void;
}