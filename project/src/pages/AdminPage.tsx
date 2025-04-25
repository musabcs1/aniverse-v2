import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          alert('You are not authorized to access this page.');
          navigate('/');
        }
      } else {
        alert('Please log in to access the admin panel.');
        navigate('/auth');
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchUsers = async () => {
    const usersCollection = collection(db, 'users');
    const userDocs = await getDocs(usersCollection);
    const usersData = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersData);
  };

  const updateRole = async (userId: string, newRole: string) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { role: newRole });
    alert(`User role updated to ${newRole}`);
    fetchUsers(); // Refresh the user list
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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