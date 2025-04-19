import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../api/services';
import { ethers } from 'ethers';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedAddress = localStorage.getItem('address');
      
      if (token && savedAddress) {
        // Try to verify the session with the backend
        try {
          const response = await authService.verifySession();
          setUser(response.user);
          setAddress(savedAddress);
          setIsAuthenticated(true);
          
          // Initialize provider
          if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // Clear invalid session data
          localStorage.removeItem('token');
          localStorage.removeItem('address');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setAddress(address);
          await authenticateWithBackend(address);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setError('Failed to check wallet connection');
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      setAddress(address);
      
      await authenticateWithBackend(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBackend = async (address: string) => {
    try {
      const signer = await provider?.getSigner();
      if (!signer) {
        throw new Error('No signer available');
      }

      // First, get the nonce from the backend
      const nonceResponse = await authService.getNonce(address);
      const message = `Sign this message to authenticate with EHR system. Nonce: ${nonceResponse.nonce}`;
      
      // Sign the message with the nonce
      const signature = await signer.signMessage(message);
      
      if (signature) {
        const response = await authService.authenticate({ address, signature });
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('address', address);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Failed to authenticate. Please try again.');
      throw error;
    }
  };

  const signMessage = async (message: string) => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await provider.getSigner();
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      setError('Failed to sign message');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAddress(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('address');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      address,
      isLoading,
      error,
      connectWallet, 
      signMessage,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 