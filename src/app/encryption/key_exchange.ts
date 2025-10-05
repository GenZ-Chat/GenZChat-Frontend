// /lib/crypto/keyExchange.ts
import { x25519, ed25519 } from "@noble/curves/ed25519.js";

/**
 * Helper functions for storing/loading Uint8Array in localStorage
 */
function saveKey(name: string, key: Uint8Array) {
  localStorage.setItem(name, JSON.stringify(Array.from(key)));
}

function loadKey(name: string): Uint8Array | null {
  const data = localStorage.getItem(name);
  return data ? Uint8Array.from(JSON.parse(data)) : null;
}

class KeyExchange {
  /**
   * Generate and store a persistent signing key (Ed25519)
   */
  async generateSigningKey() {
    const signKey = ed25519.utils.randomSecretKey();
    const signPub = ed25519.getPublicKey(signKey);
    saveKey("sign_private_key", signKey);
    saveKey("sign_public_key", signPub);
    return { signKey, signPub };
  }

  /**
   * Generate and store a persistent encryption key (X25519)
   */
  async generateEncryptionKey() {
    const privKey = x25519.utils.randomSecretKey();
    saveKey("private_key", privKey);
    return privKey;
  }

  /**
   * Get persistent signing key (generate if not exist)
   */
  async getSigningKey() {
    const storedPriv = loadKey("sign_private_key");
    const storedPub = loadKey("sign_public_key");
    if (storedPriv && storedPub) {
      return { signKey: storedPriv, signPub: storedPub };
    }
    return this.generateSigningKey();
  }

  /**
   * Get persistent encryption private key (generate if not exist)
   */
  async getEncryptionPrivateKey() {
    let privKey = loadKey("private_key");
    if (!privKey) {
      privKey = await this.generateEncryptionKey();
    }
    return privKey;
  }

  /**
   * Get the device's public key + signature
   * The public key is signed with the persistent signing key
   */
  async getPublicKey() {
    const privKey = await this.getEncryptionPrivateKey();
    const pubKey = x25519.getPublicKey(privKey);

    const { signKey, signPub } = await this.getSigningKey();
    const signedKey = ed25519.sign(pubKey, signKey);

    return {
      publicKey: pubKey,
      signPublicKey: signPub,
      signedKey,
    };
  }

  /**
   * Derive shared secret from a peer's public key
   */
  async getSharedSecret(peerPublicKey: Uint8Array) {
    const privKey = await this.getEncryptionPrivateKey();
    return x25519.getSharedSecret(privKey, peerPublicKey);
  }
}

export const keyExchange = new KeyExchange();

export async function testKeyExchange() {
  // 1. Get own public key (signed)
  const { publicKey, signPublicKey, signedKey } = await keyExchange.getPublicKey();
  console.log("Public Key:", publicKey);
  console.log("Signing Public Key:", signPublicKey);
  console.log("Signed Public Key:", signedKey);

  // 2. Simulate receiving peer public key
  const peerPriv = x25519.utils.randomSecretKey();
  const peerPub = x25519.getPublicKey(peerPriv);

  // 3. Get shared secret
  const sharedSecret = await keyExchange.getSharedSecret(peerPub);
  console.log("Shared Secret:", sharedSecret);
}

testKeyExchange();
