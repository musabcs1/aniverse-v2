import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, collection, getDocs, updateDoc } from 'firebase/firestore';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // State to store user data

  // Check if the user is an admin
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setIsAdmin(true);
    } else {
      navigate('/admin-login'); // Redirect to admin login page if not authenticated
    }
  }, [navigate]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userDocs = await getDocs(usersCollection);
      const usersData = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Update user role in Firestore
  const updateRole = async (userId: string, newRole: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      alert(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh the user list after updating the role
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // If the user is not an admin, show nothing
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 gap-6">
          {users.map(user => (
            <div key={user.id} className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{user.username}</h2>
              <p className="text-gray-400">Email: {user.email}</p>
              <p className="text-gray-400">Role: {user.role}</p>
              <div className="mt-4">
                <button
                  className="btn-primary mr-2"
                  onClick={() => updateRole(user.id, 'admin')}
                >
                  Make Admin
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => updateRole(user.id, 'user')}
                >
                  Make User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;