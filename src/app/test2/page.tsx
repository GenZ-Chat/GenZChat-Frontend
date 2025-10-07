"use client";

import React, { useState, useEffect } from "react";
import { KeyExchange, uint8ArrayToBase64, base64ToUint8Array } from "@/app/encryption/key_exchange";
import { useSession } from "next-auth/react";

export default function TestKeyExchangePage() {
  const [myPublicKey, setMyPublicKey] = useState<string>("");
  const [myPrivateKey, setMyPrivateKey] = useState<string>("");
  const [localStoragePrivateKey, setLocalStoragePrivateKey] = useState<string>("");
  const [peerPublicKeyInput, setPeerPublicKeyInput] = useState<string>("");
  const [sharedSecret, setSharedSecret] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const { data: session } = useSession();
  const userId = session?.user?.id as string || "user1"; // Fallback to "user1" if undefined
  const keyExchange = new KeyExchange(userId);

  useEffect(() => {
    const setupKeys = async () => {
      try {
        const { publicKey } = await keyExchange.getPublicKey();
        setMyPublicKey(uint8ArrayToBase64(publicKey));
        
        const privateKey = await keyExchange.getEncryptionPrivateKey();
        setMyPrivateKey(uint8ArrayToBase64(privateKey));

        // Get private key from localStorage and convert to readable format
        if (typeof window !== 'undefined') {
          const storedPrivateKey = localStorage.getItem(`private_key:${userId.trim()}`) || "";
          if (storedPrivateKey) {
            try {
              // Parse the JSON array and convert to Uint8Array, then to Base64
              const keyArray = JSON.parse(storedPrivateKey);
              const keyUint8Array = new Uint8Array(keyArray);
              const readableKey = uint8ArrayToBase64(keyUint8Array);
              setLocalStoragePrivateKey(readableKey);
            } catch (error) {
              // If it's already in a different format, show as is
              setLocalStoragePrivateKey(storedPrivateKey);
            }
          }
        }
      } catch (err) {
        console.error("Error generating keys:", err);
      }
    };
    setupKeys();
  }, [userId]);

  const handleComputeSharedSecret = async () => {
    try {
      const peerPublicKey = base64ToUint8Array(peerPublicKeyInput.trim());
      const secret = await keyExchange.getSharedSecret(peerPublicKey);
      const secretB64 = uint8ArrayToBase64(secret);
      setSharedSecret(secretB64);
      setMessage("✅ Shared secret computed successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to compute shared secret");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-8">
      <div className="max-w-xl w-full bg-gray-900 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          🔐 Diffie–Hellman Key Exchange Test
        </h1>

        <div className="mb-4">
          <p className="font-semibold mb-2 text-gray-300">Your Public Key:</p>
          <textarea
            readOnly
            value={myPublicKey}
            className="w-full p-3 bg-gray-800 rounded-md text-xs text-gray-300 break-all"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2 text-gray-300">Your Private Key (Base64):</p>
          <textarea
            readOnly
            value={myPrivateKey}
            className="w-full p-3 bg-gray-800 rounded-md text-xs text-gray-300 break-all"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2 text-gray-300">LocalStorage Private Key (Base64):</p>
          <textarea
            readOnly
            value={localStoragePrivateKey}
            className="w-full p-3 bg-gray-800 rounded-md text-xs text-gray-300 break-all"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2 text-gray-300">Enter Peer’s Public Key (Base64):</p>
          <textarea
            value={peerPublicKeyInput}
            onChange={(e) => setPeerPublicKeyInput(e.target.value)}
            placeholder="Paste peer's base64 public key here..."
            className="w-full p-3 bg-gray-800 rounded-md text-xs text-gray-300 focus:ring-2 focus:ring-emerald-500"
            rows={3}
          />
        </div>

        <button
          onClick={handleComputeSharedSecret}
          className="w-full py-2 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-semibold transition"
        >
          Compute Shared Secret
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-300">{message}</p>
        )}

        {sharedSecret && (
          <div className="mt-4">
            <p className="font-semibold mb-2 text-gray-300">Derived Shared Secret (Base64):</p>
            <textarea
              readOnly
              value={sharedSecret}
              className="w-full p-3 bg-gray-800 rounded-md text-xs text-gray-300 break-all"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
