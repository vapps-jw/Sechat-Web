export const UserClaims = {
  ChatAccess: "ChatAccess",
};

export class UserProfile {
  email?: string;
  userName?: string;
  profilePicture?: string;
  lastActivity?: Date;
  created?: Date;
  emailConfirmed?: boolean;
  invitationsAllowed?: boolean;
  referralPass?: string;
  claims?: string[];
}
