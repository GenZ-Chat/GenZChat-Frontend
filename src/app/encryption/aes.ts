import { uint8ArrayToBase64, base64ToUint8Array } from "./key_exchange";

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

  async encryptMessage(message: string, sharedSecret: Uint8Array): Promise<{ciphertext: ArrayBuffer, iv: Uint8Array}> {
    const enc = new TextEncoder();
    const encodedMessage = enc.encode(message);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV length is 12 bytes
    const key = await this.generateKey(sharedSecret);
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

  async decrypt(sharedSecret: Uint8Array, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<string> {
    const key = await this.generateKey(sharedSecret);
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

  // Helper method to encrypt and return base64-encoded result for JSON serialization
  async encryptMessageToBase64(message: string, sharedSecret: Uint8Array): Promise<{ciphertext: string, iv: string}> {
    const result = await this.encryptMessage(message, sharedSecret);
    return {
      ciphertext: uint8ArrayToBase64(new Uint8Array(result.ciphertext)),
      iv: uint8ArrayToBase64(result.iv)
    };
  }

  // Helper method to decrypt from base64-encoded data
  async decryptFromBase64(sharedSecret: Uint8Array, ciphertextBase64: string, ivBase64: string): Promise<string> {
    const ciphertextArray = base64ToUint8Array(ciphertextBase64);
    const ciphertext = new ArrayBuffer(ciphertextArray.length);
    new Uint8Array(ciphertext).set(ciphertextArray);
    const iv = base64ToUint8Array(ivBase64);
    return this.decrypt(sharedSecret, ciphertext, iv);
  }
}

export const aesEncryption = new AESEncryption();

        
    
