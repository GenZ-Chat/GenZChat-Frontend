'use client';

import { api } from '@/app/config/api_config';
import { getKeyExchangeForUser, uint8ArrayToBase64 } from '@/app/encryption/key_exchange';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoadingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const initializeKeys = async () => {
      if (!userId) return;

      try {
        // Generate keys for the user using their formatted ID
        const userKeyExchange = getKeyExchangeForUser(userId);
        const { publicKey, signPublicKey, signedKey } = await userKeyExchange.getPublicKey();

        // Convert keys to Base64
        const publicKeyString = uint8ArrayToBase64(publicKey);
        const signedPublicKeyString = uint8ArrayToBase64(signPublicKey);
        const signedKeyString = uint8ArrayToBase64(signedKey);

        // ✅ FIXED: removed extra "}" from URL
        await api.patch(`/users/${userId}`, {
          publicKey: publicKeyString,
          signedPublicKey: signedPublicKeyString,
          signedKey: signedKeyString,
        });

        console.log('✅ Updated existing user with new keys');

        // Store private key
        const privateKey = await userKeyExchange.getEncryptionPrivateKey();
        localStorage.setItem('privateKey', uint8ArrayToBase64(privateKey));


        // ✅ Absolute redirect
        router.replace('/chat');
      } catch (error) {
        console.error('❌ Error during key initialization:', error);
      }
    };

    initializeKeys();
    document.title = 'Loading...';
  }, [userId, router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
      }}
    >
      Loading... Please wait.
    </div>
  );
}
