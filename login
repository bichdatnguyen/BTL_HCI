interface User {
  id: string;
  streak: number;            // số lần login liên tiếp hợp lệ (<24h)
  lastLogin: string | null;  // ISO string
}

function updateLoginStreak(user: User): User {
  const now = new Date();

  // Chưa login lần nào → bắt đầu streak
  if (!user.lastLogin) {
    return {
      ...user,
      streak: 1,
      lastLogin: now.toISOString()
    };
  }

  const last = new Date(user.lastLogin);

  // Tính chênh lệch thời gian
  const diffMs = now.getTime() - last.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let newStreak = user.streak;

  // Nếu trễ >= 24h → reset streak
  if (diffHours >= 24) {
    newStreak = 0;
  }

  // Mỗi lần login: streak + 1
  newStreak += 1;

  return {
    ...user,
    streak: newStreak,
    lastLogin: now.toISOString()
  };
}
