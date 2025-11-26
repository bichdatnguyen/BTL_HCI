import type { User } from "../../shared/api";

/**
 * In-memory user storage
 * In production, this would be a database
 */
const users: Map<string, User> = new Map([
  [
    "1",
    {
      id: "1",
      username: "bi_bi_2015",
      name: "Minh",
      avatar: "🐶",
      initials: "M",
      password: "password123",
      streak: 0,
      lastLoginDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

/**
 * Find a user by username
 */
export function findUserByUsername(username: string): User | undefined {
  for (const user of users.values()) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): User | undefined {
  return users.get(id);
}

/**
 * Update user
 */
export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = users.get(id);
  if (!user) return undefined;

  const updatedUser = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users.set(id, updatedUser);
  return updatedUser;
}

/**
 * Calculate streak based on login dates
 */
export function calculateStreak(user: User): {
  newStreak: number;
  shouldUpdate: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  // Case A: Same day - no change
  if (user.lastLoginDate === todayString) {
    return { newStreak: user.streak, shouldUpdate: false };
  }

  // First login or no previous login
  if (!user.lastLoginDate) {
    return { newStreak: 1, shouldUpdate: true };
  }

  const lastLogin = new Date(user.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);

  const oneDay = 24 * 60 * 60 * 1000;
  const timeDiff = today.getTime() - lastLogin.getTime();
  const daysDiff = Math.floor(timeDiff / oneDay);

  // Case B: Consecutive day - increment streak
  if (daysDiff === 1) {
    return { newStreak: user.streak + 1, shouldUpdate: true };
  }

  // Case C: Missed a day or more - reset streak to 1
  if (daysDiff > 1) {
    return { newStreak: 1, shouldUpdate: true };
  }

  return { newStreak: user.streak, shouldUpdate: false };
}

/**
 * Update user streak on login
 */
export function updateStreakOnLogin(id: string): User | undefined {
  const user = findUserById(id);
  if (!user) return undefined;

  const { newStreak, shouldUpdate } = calculateStreak(user);

  if (shouldUpdate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];

    return updateUser(id, {
      streak: newStreak,
      lastLoginDate: todayString,
    });
  }

  return user;
}
