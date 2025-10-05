class AESEncryption {

  async generateKey(sharedSecret: Uint8Array): Promise<CryptoKey> {
    // Use the shared secret directly as key material
    // Create a new Uint8Array to ensure proper typing
    const keyMaterial = new Uint8Array(sharedSecret);
    const hashedKey = await crypto.subtle.digest('SHA-256', keyMaterial);
    return crypto.subtle.importKey(
      'raw',
      hashedKey,
      'AES-GCM',
      false, // not extractable 
      ['encrypt', 'decrypt']
    );
  }

  async encryptMessage(message: string, key: CryptoKey): Promise<{ciphertext: ArrayBuffer, iv: Uint8Array}> {
    const enc = new TextEncoder();
    const encodedMessage = enc.encode(message);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV length is 12 bytes
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedMessage
    );
    return {ciphertext, iv};
  }

  async decrypt(key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      { 
        name: "AES-GCM", 
        iv: iv as BufferSource
      },
      key,
      ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }
}

export const aesEncryption = new AESEncryption();

        
    
