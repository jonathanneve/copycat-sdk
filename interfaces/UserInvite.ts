//Created when a user wants to give another user a role in one or all configs, but that user doesn't exist yet.
//The user gets sent an email invite, and if / when they create an account, the UserInvite will get converted into a UserRole
export class UserInvite{
    userEmail: string;
    targetUser: string;
    targetConfig: string;
    role: string;
}