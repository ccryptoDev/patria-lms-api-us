export const getUserData = (): {
  email: string;
  id: string;
  practiceManagement: string;
  role: string;
  userName: string;
} | null => {
  const adminToken = JSON.parse(localStorage.getItem("adminToken") || "");
  if (adminToken) {
    return {
      email: adminToken.email,
      id: adminToken.id,
      practiceManagement: adminToken.practiceManagement,
      role: adminToken.role,
      userName: adminToken.userName,
    };
  }

  return null;
};
