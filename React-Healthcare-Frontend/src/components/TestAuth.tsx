import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export default function TestAuth() {
  const { connectWallet, address, isAuthenticated, user } = useAuth();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Blockchain Auth Test</h2>
      
      {!isAuthenticated ? (
        <Button onClick={handleConnect}>
          Connect Wallet
        </Button>
      ) : (
        <div className="space-y-2">
          <p>Connected Address: {address}</p>
          <p>User Role: {user?.role}</p>
          <p>Status: Authenticated</p>
        </div>
      )}
    </div>
  );
} 