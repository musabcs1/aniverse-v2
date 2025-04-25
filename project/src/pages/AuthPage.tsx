import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions
import { auth, db } from '../firebaseConfig'; // Import Firestore
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (userCredential.user) {
          const userDocRef = doc(db, "users", userCredential.user.uid); // Reference to Firestore document
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            localStorage.setItem('userData', JSON.stringify(userData));
            window.dispatchEvent(new Event('storage')); // 🔔 event triggered
            navigate('/profile');
          } else {
            console.error("User data not found in Firestore.");
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          username,
          email,
          level: 0,
          joinDate: new Date().toISOString(),
          avatar: "https://i.pravatar.cc/150?img=33",
          badges: [],
          watchlist: [],
          role: 'user', // Varsayılan olarak 'user' rolü atanır
        };

        // Store userData in Firestore
        const userDocRef = doc(db, "users", userCredential.user.uid); // Reference to Firestore document
        await setDoc(userDocRef, userData);

        localStorage.setItem('userData', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage')); // 🔔 event triggered
        alert('Account created successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
      alert('Authentication failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-black p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Register'}</h2>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="mb-4 p-2 border w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="mb-4 p-2 border w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 border w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
        <p className="mt-4 text-sm text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
