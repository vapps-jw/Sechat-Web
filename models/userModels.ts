interface IUserProfile {
  id: string;
  email: string;
  name: string;
}

class UserProfile implements IUserProfile {
  constructor() {
    this.id = "";
    this.email = "";
    this.name = "";
  }

  id: string;
  email: string;
  name: string;
}
