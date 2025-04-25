import { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Firestore'daki `admins` koleksiyonundan email ile eşleşen belgeyi sorgula
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid email or password.');
        return;
      }

      const adminData = querySnapshot.docs[0].data();

      // Şifre doğrulama (hash kullanıyorsanız burada hash karşılaştırması yapın)
      if (adminData.password !== password) {
        setError('Invalid email or password.');
        return;
      }

      // Admin verilerini localStorage'a kaydet ve admin paneline yönlendir
      localStorage.setItem('adminData', JSON.stringify(adminData));
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-white">
      <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Admin Login</h2>
          <p className="text-gray-400 mt-2">Sign in to access the admin panel</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-surface-light py-3 pl-10 pr-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-surface-light py-3 pl-10 pr-4 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary py-3 rounded-lg text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;