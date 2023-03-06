export interface AddRoleData {
  guildId: string;
  userId: string;
  roleId: string;
  channelId: string;
}

export interface AddRoleDataDb {
  walletAddress: string;
  userId: string;
  roleId: string;
  guildId: string;
}
