interface IUserProfile {
  email?: string;
  userName?: string;
  profilePicture?: string;
  lastActivity?: Date;
  created?: Date;
  emailConfirmed?: boolean;
  invitationsAllowed?: boolean;
}
