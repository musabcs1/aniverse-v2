import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
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
    const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(users);
  };

  if (!isAdmin) {
    return null; // Admin yetkisi kontrol edilirken boş bir ekran gösterilir
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
            <p className="text-gray-400">View and manage user accounts.</p>
            <button className="btn-primary mt-4" onClick={fetchUsers}>Go to Users</button>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Content</h2>
            <p className="text-gray-400">Add, edit, or delete content.</p>
            <button className="btn-primary mt-4">Go to Content</button>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">View Analytics</h2>
            <p className="text-gray-400">Track site performance and user activity.</p>
            <button className="btn-primary mt-4">View Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;