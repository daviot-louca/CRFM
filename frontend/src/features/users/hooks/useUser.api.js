
import { useCallback, useEffect, useState } from "react";
import {
  getUsersBySection,
  createUser,
  updateUser,
  deleteUser,
} from "../api/user.api";

export function useUsers(sectionId) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(Boolean(sectionId));
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    if (!sectionId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUsersBySection(sectionId);
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  const addUser = async (userData) => {
    const newUser = await createUser({ ...userData, sectionId });
    await fetchUsers();
    return newUser;
  };

  const editUser = async (userId, userData) => {
    const updatedUser = await updateUser(userId, userData);
    await fetchUsers();
    return updatedUser;
  };

  const removeUser = async (userId) => {
    await deleteUser(userId);
    await fetchUsers();
  };

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };

    loadUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refreshUsers: fetchUsers,
  };
}