"use client";

import { useState } from "react";
import { keyExchange } from "../encryption/key_exchange";
import { aesEncryption } from "../encryption/aes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
    console.clear();
  };

  const testGenerateKeys = async () => {
    setIsLoading(true);
    try {
      addLog("🔑 Testing key generation...");
      
      // Test signing key generation
      const signingKeys = await keyExchange.generateSigningKey();
      addLog(`✅ Signing keys generated - Private: ${signingKeys.signKey.length} bytes, Public: ${signingKeys.signPub.length} bytes`);
      
      // Test encryption key generation
      const encryptionKey = await keyExchange.generateEncryptionKey();
      addLog(`✅ Encryption key generated - ${encryptionKey.length} bytes`);
      
    } catch (error) {
      addLog(`❌ Error generating keys: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetPublicKey = async () => {
    setIsLoading(true);
    try {
      addLog("📤 Testing public key retrieval...");
      
      const { publicKey, signPublicKey, signedKey } = await keyExchange.getPublicKey();
      
      addLog(`✅ Public key retrieved - ${publicKey.length} bytes`);
      addLog(`✅ Signing public key - ${signPublicKey.length} bytes`);
      addLog(`✅ Signature - ${signedKey.length} bytes`);
      
      // Log hex values for debugging
      addLog(`🔍 Public Key (hex): ${Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      addLog(`🔍 Sign Public Key (hex): ${Array.from(signPublicKey).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
    } catch (error) {
      addLog(`❌ Error getting public key: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testKeyExchange = async () => {
    setIsLoading(true);
    try {
      addLog("🤝 Testing full key exchange simulation...");
      
      // Generate our keys
      const ourKeys = await keyExchange.getPublicKey();
      addLog(`✅ Our public key generated`);
      
      // Simulate peer's keys (in real scenario, this would come from another user)
      const { x25519 } = await import("@noble/curves/ed25519.js");
      const peerPrivateKey = x25519.utils.randomSecretKey();
      const peerPublicKey = x25519.getPublicKey(peerPrivateKey);
      addLog(`✅ Peer public key simulated`);
      
      // Generate shared secret from our side
      const ourSharedSecret = await keyExchange.getSharedSecret(peerPublicKey);
      addLog(`✅ Our shared secret generated - ${ourSharedSecret.length} bytes`);
      
      // Simulate peer generating shared secret (for verification)
      const ourPrivateKey = await keyExchange.getEncryptionPrivateKey();
      const peerSharedSecret = x25519.getSharedSecret(peerPrivateKey, ourKeys.publicKey);
      addLog(`✅ Peer shared secret simulated - ${peerSharedSecret.length} bytes`);
      
      // Verify both shared secrets are identical
      const secretsMatch = Array.from(ourSharedSecret).every((byte, index) => byte === peerSharedSecret[index]);
      
      if (secretsMatch) {
        addLog(`🎉 SUCCESS: Shared secrets match! Key exchange completed successfully.`);
        addLog(`🔍 Shared Secret (hex): ${Array.from(ourSharedSecret).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      } else {
        addLog(`❌ FAILURE: Shared secrets don't match!`);
      }
      
    } catch (error) {
      addLog(`❌ Error during key exchange: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPersistentKeys = async () => {
    setIsLoading(true);
    try {
      addLog("💾 Testing key persistence...");
      
      // Get keys (should create if not exist)
      const keys1 = await keyExchange.getPublicKey();
      addLog(`✅ First key retrieval completed`);
      
      // Get keys again (should load from storage)
      const keys2 = await keyExchange.getPublicKey();
      addLog(`✅ Second key retrieval completed`);
      
      // Compare if keys are the same (testing persistence)
      const publicKeysMatch = Array.from(keys1.publicKey).every((byte, index) => byte === keys2.publicKey[index]);
      const signKeysMatch = Array.from(keys1.signPublicKey).every((byte, index) => byte === keys2.signPublicKey[index]);
      
      if (publicKeysMatch && signKeysMatch) {
        addLog(`🎉 SUCCESS: Keys are persistent across calls`);
      } else {
        addLog(`❌ FAILURE: Keys are not persistent`);
      }
      
    } catch (error) {
      addLog(`❌ Error testing persistence: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredKeys = () => {
    try {
      localStorage.removeItem("sign_private_key");
      localStorage.removeItem("sign_public_key");
      localStorage.removeItem("private_key");
      addLog("🗑️ All stored keys cleared from localStorage");
    } catch (error) {
      addLog(`❌ Error clearing keys: ${error}`);
    }
  };

  const testAESKeyGeneration = async () => {
    setIsLoading(true);
    try {
      addLog("🔐 Testing AES key generation from shared secret...");
      
      // Create a mock shared secret (simulating ECDH output)
      const mockSharedSecret = crypto.getRandomValues(new Uint8Array(32));
      addLog(`✅ Mock shared secret generated - ${mockSharedSecret.length} bytes`);
      addLog(`🔍 Shared Secret (hex): ${Array.from(mockSharedSecret).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
      // Generate AES key from shared secret
      const aesKey = await aesEncryption.generateKey(mockSharedSecret);
      addLog(`✅ AES-GCM key generated successfully`);
      addLog(`🔍 Key algorithm: ${aesKey.algorithm.name}`);
      addLog(`🔍 Key type: ${aesKey.type}`);
      addLog(`🔍 Key extractable: ${aesKey.extractable}`);
      addLog(`🔍 Key usages: ${aesKey.usages.join(', ')}`);
      
    } catch (error) {
      addLog(`❌ Error generating AES key: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAESEncryption = async () => {
    setIsLoading(true);
    try {
      addLog("🔒 Testing AES-GCM encryption with detailed debugging...");
      
      // Test message
      const testMessage = "Hello, this is a secret message encrypted with AES-GCM! 🔐";
      addLog(`📝 Test message: "${testMessage}"`);
      addLog(`📝 Message length: ${testMessage.length} characters`);
      addLog(`📝 Message UTF-8 bytes: ${new TextEncoder().encode(testMessage).length}`);
      
      // Show message in hex
      const messageBytes = new TextEncoder().encode(testMessage);
      const messageHex = Array.from(messageBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
      addLog(`🔍 Message (hex): ${messageHex}`);
      
      // Generate key from mock shared secret
      const mockSharedSecret = crypto.getRandomValues(new Uint8Array(32));
      addLog(`🔍 Shared secret (hex): ${Array.from(mockSharedSecret).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
      const aesKey = await aesEncryption.generateKey(mockSharedSecret);
      addLog(`✅ AES key generated for encryption`);
      
      // Encrypt the message
      addLog(`\n🔒 Starting encryption process...`);
      const { ciphertext, iv } = await aesEncryption.encryptMessage(testMessage, aesKey);
      addLog(`✅ Message encrypted successfully`);
      
      // Detailed encryption analysis
      addLog(`\n🔍 Encryption Results:`);
      addLog(`   • Original message: ${testMessage.length} chars`);
      addLog(`   • Original bytes: ${messageBytes.length} bytes`);
      addLog(`   • IV length: ${iv.length} bytes`);
      addLog(`   • Ciphertext length: ${ciphertext.byteLength} bytes`);
      addLog(`   • Overhead: ${ciphertext.byteLength - messageBytes.length} bytes (authentication tag)`);
      
      // IV analysis
      addLog(`\n🔍 IV (Initialization Vector):`);
      addLog(`   • Length: ${iv.length} bytes (standard for AES-GCM)`);
      addLog(`   • Hex: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      addLog(`   • Binary: ${Array.from(iv).map(b => b.toString(2).padStart(8, '0')).join(' ')}`);
      
      // Ciphertext analysis
      const ciphertextArray = new Uint8Array(ciphertext);
      addLog(`\n🔍 Ciphertext Analysis:`);
      addLog(`   • Total length: ${ciphertextArray.length} bytes`);
      addLog(`   • Data portion: ${ciphertextArray.length - 16} bytes`);
      addLog(`   • Auth tag: 16 bytes (last 16 bytes)`);
      
      // Full hex dump of ciphertext
      const ciphertextHex = Array.from(ciphertextArray).map(b => b.toString(16).padStart(2, '0')).join('');
      addLog(`   • Full hex: ${ciphertextHex}`);
      
      // Chunked hex display for readability
      const chunks = [];
      for (let i = 0; i < ciphertextHex.length; i += 32) {
        chunks.push(ciphertextHex.slice(i, i + 32));
      }
      addLog(`\n🔍 Ciphertext (chunked hex):`);
      chunks.forEach((chunk, index) => {
        const offset = (index * 16).toString(16).padStart(4, '0');
        addLog(`   ${offset}: ${chunk}`);
      });
      
      // Entropy analysis
      const byteFreq = new Array(256).fill(0);
      ciphertextArray.forEach(byte => byteFreq[byte]++);
      const uniqueBytes = byteFreq.filter(freq => freq > 0).length;
      addLog(`\n🔍 Entropy Analysis:`);
      addLog(`   • Unique byte values: ${uniqueBytes}/256`);
      addLog(`   • Entropy quality: ${uniqueBytes > 200 ? 'High (good)' : uniqueBytes > 150 ? 'Medium' : 'Low (concerning)'}`);
      
    } catch (error) {
      addLog(`❌ Error during AES encryption: ${error}`);
      console.error('Detailed error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAESFullCycle = async () => {
    setIsLoading(true);
    try {
      addLog("🔄 Testing full AES-GCM encrypt/decrypt cycle...");
      
      // Test messages of different lengths and content
      const testMessages = [
        "Short",
        "Medium length message with special chars: !@#$%^&*()",
        "Very long message that tests AES-GCM with larger payloads. This message contains multiple sentences and should thoroughly test the encryption and decryption process. It includes emojis 🚀✨🔐💻🌟 and various characters to ensure proper handling.",
        "{\"json\": \"data\", \"numbers\": [1,2,3], \"unicode\": \"🌍🔒\"}",
        ""  // Empty string test
      ];
      
      for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        const displayMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
        addLog(`\n📝 Test ${i + 1}: "${displayMessage || '(empty string)'}"`);
        
        // Generate key from mock shared secret
        const mockSharedSecret = crypto.getRandomValues(new Uint8Array(32));
        const aesKey = await aesEncryption.generateKey(mockSharedSecret);
        
        // Encrypt with debugging
        addLog(`   🔒 Encrypting...`);
        const { ciphertext, iv } = await aesEncryption.encryptMessage(message, aesKey);
        addLog(`   ✅ Encrypted: ${message.length} chars → ${ciphertext.byteLength} bytes`);
        
        // Debug encryption details for interesting cases
        if (i === 0 || message.length === 0 || message.includes('json')) {
          const ciphertextArray = new Uint8Array(ciphertext);
          addLog(`   🔍 IV: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}`);
          addLog(`   🔍 Ciphertext (first 16 bytes): ${Array.from(ciphertextArray.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('')}`);
          addLog(`   🔍 Auth tag (last 16 bytes): ${Array.from(ciphertextArray.slice(-16)).map(b => b.toString(16).padStart(2, '0')).join('')}`);
        }
        
        // Decrypt with debugging
        addLog(`   🔓 Decrypting...`);
        const decryptedMessage = await aesEncryption.decrypt(aesKey, ciphertext, iv);
        addLog(`   ✅ Decrypted: ${ciphertext.byteLength} bytes → ${decryptedMessage.length} chars`);
        
        // Verify integrity with detailed comparison
        if (message === decryptedMessage) {
          addLog(`   🎉 SUCCESS: Original and decrypted messages match!`);
        } else {
          addLog(`   ❌ FAILURE: Messages don't match!`);
          addLog(`   📝 Original (${message.length}): "${message}"`);
          addLog(`   📝 Decrypted (${decryptedMessage.length}): "${decryptedMessage}"`);
          
          // Byte-by-byte comparison for debugging
          const originalBytes = new TextEncoder().encode(message);
          const decryptedBytes = new TextEncoder().encode(decryptedMessage);
          addLog(`   🔍 Original bytes: ${Array.from(originalBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
          addLog(`   🔍 Decrypted bytes: ${Array.from(decryptedBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
        }
      }
      
    } catch (error) {
      addLog(`❌ Error during full cycle test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testKeyExchangeWithAES = async () => {
    setIsLoading(true);
    try {
      addLog("🤝🔐 Testing Key Exchange integrated with AES-GCM...");
      
      // Step 1: Perform key exchange
      addLog("\n📋 Step 1: Performing ECDH key exchange...");
      const ourKeys = await keyExchange.getPublicKey();
      addLog(`✅ Our keys generated`);
      
      // Simulate peer's keys
      const { x25519 } = await import("@noble/curves/ed25519.js");
      const peerPrivateKey = x25519.utils.randomSecretKey();
      const peerPublicKey = x25519.getPublicKey(peerPrivateKey);
      addLog(`✅ Peer keys simulated`);
      
      // Generate shared secrets (both parties)
      const ourSharedSecret = await keyExchange.getSharedSecret(peerPublicKey);
      const ourPrivateKey = await keyExchange.getEncryptionPrivateKey();
      const peerSharedSecret = x25519.getSharedSecret(peerPrivateKey, ourKeys.publicKey);
      
      // Verify shared secrets match
      const secretsMatch = Array.from(ourSharedSecret).every((byte, index) => byte === peerSharedSecret[index]);
      if (secretsMatch) {
        addLog(`✅ Shared secrets match (${ourSharedSecret.length} bytes)`);
      } else {
        addLog(`❌ Shared secrets don't match!`);
        return;
      }
      
      // Step 2: Derive AES keys from shared secret
      addLog("\n📋 Step 2: Deriving AES keys from shared secret...");
      const ourAesKey = await aesEncryption.generateKey(ourSharedSecret);
      const peerAesKey = await aesEncryption.generateKey(peerSharedSecret);
      addLog(`✅ AES keys derived from ECDH shared secret`);
      
      // Step 3: Test encryption/decryption
      addLog("\n📋 Step 3: Testing end-to-end encryption...");
      const secretMessage = "This is a confidential message sent using ECDH key exchange + AES-GCM encryption! 🔐🤝";
      addLog(`📝 Secret message: "${secretMessage}"`);
      
      // Our side encrypts with debugging
      addLog(`🔒 Sender encrypting message...`);
      const { ciphertext, iv } = await aesEncryption.encryptMessage(secretMessage, ourAesKey);
      addLog(`✅ Message encrypted by sender`);
      addLog(`   🔍 Encrypted payload size: ${ciphertext.byteLength} bytes`);
      addLog(`   🔍 IV: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
      const ciphertextArray = new Uint8Array(ciphertext);
      addLog(`   🔍 Ciphertext preview: ${Array.from(ciphertextArray.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join('')}...`);
      addLog(`   🔍 Auth tag: ${Array.from(ciphertextArray.slice(-16)).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
      // Peer side decrypts with debugging
      addLog(`🔓 Receiver decrypting message...`);
      const decryptedByPeer = await aesEncryption.decrypt(peerAesKey, ciphertext, iv);
      addLog(`✅ Message decrypted by receiver`);
      addLog(`   🔍 Decrypted length: ${decryptedByPeer.length} characters`);
      
      // Verify end-to-end encryption works
      if (secretMessage === decryptedByPeer) {
        addLog(`🎉 SUCCESS: End-to-end encryption working perfectly!`);
        addLog(`📝 Original:  "${secretMessage}"`);
        addLog(`📝 Decrypted: "${decryptedByPeer}"`);
      } else {
        addLog(`❌ FAILURE: End-to-end encryption failed!`);
      }
      
      // Step 4: Test bidirectional communication
      addLog("\n📋 Step 4: Testing bidirectional communication...");
      const replyMessage = "Got your message! This is the reply. 📨";
      
      // Peer encrypts reply with debugging
      addLog(`🔒 Receiver encrypting reply...`);
      const { ciphertext: replyCiphertext, iv: replyIv } = await aesEncryption.encryptMessage(replyMessage, peerAesKey);
      addLog(`✅ Reply encrypted by receiver`);
      addLog(`   🔍 Reply ciphertext: ${replyCiphertext.byteLength} bytes`);
      addLog(`   🔍 Reply IV: ${Array.from(replyIv).map(b => b.toString(16).padStart(2, '0')).join('')}`);
      
      // We decrypt reply with debugging
      addLog(`🔓 Sender decrypting reply...`);
      const decryptedReply = await aesEncryption.decrypt(ourAesKey, replyCiphertext, replyIv);
      addLog(`✅ Reply decrypted by sender`);
      
      if (replyMessage === decryptedReply) {
        addLog(`🎉 SUCCESS: Bidirectional communication working!`);
        addLog(`📝 Reply: "${decryptedReply}"`);
      } else {
        addLog(`❌ FAILURE: Bidirectional communication failed!`);
      }
      
    } catch (error) {
      addLog(`❌ Error during integrated test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMessageDebugging = async () => {
    setIsLoading(true);
    try {
      addLog("🔎 Deep message debugging and analysis...");
      
      const testCases = [
        { name: "ASCII", message: "Hello World!" },
        { name: "Unicode", message: "Hello 🌍! Café naïve résumé" },
        { name: "Numbers", message: "1234567890" },
        { name: "Special Chars", message: "!@#$%^&*()_+-=[]{}|;':,.<>?" },
        { name: "Binary-like", message: "\\x00\\x01\\x02\\x03\\xFF" },
        { name: "JSON", message: '{"key":"value","number":42,"array":[1,2,3]}' },
        { name: "Long Text", message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10) },
        { name: "Empty", message: "" }
      ];
      
      for (const testCase of testCases) {
        addLog(`\n🧪 Testing ${testCase.name}: "${testCase.message.substring(0, 50)}${testCase.message.length > 50 ? '...' : ''}"`);
        
        // Message analysis
        const messageBytes = new TextEncoder().encode(testCase.message);
        addLog(`   📊 Message stats:`);
        addLog(`      • Characters: ${testCase.message.length}`);
        addLog(`      • UTF-8 bytes: ${messageBytes.length}`);
        addLog(`      • Byte entropy: ${new Set(messageBytes).size}/256 unique bytes`);
        
        // Generate key and encrypt
        const sharedSecret = crypto.getRandomValues(new Uint8Array(32));
        const key = await aesEncryption.generateKey(sharedSecret);
        const { ciphertext, iv } = await aesEncryption.encryptMessage(testCase.message, key);
        
        // Encryption analysis
        const ciphertextBytes = new Uint8Array(ciphertext);
        addLog(`   🔒 Encryption results:`);
        addLog(`      • Ciphertext: ${ciphertextBytes.length} bytes`);
        addLog(`      • Expansion ratio: ${(ciphertextBytes.length / messageBytes.length).toFixed(2)}x`);
        addLog(`      • IV: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}`);
        
        // Pattern analysis
        const repeatedBytes: Record<number, number> = {};
        ciphertextBytes.forEach(byte => {
          repeatedBytes[byte] = (repeatedBytes[byte] || 0) + 1;
        });
        const maxRepeats = Math.max(...Object.values(repeatedBytes) as number[]);
        addLog(`      • Max byte repetition: ${maxRepeats} times ${maxRepeats > 3 ? '(⚠️ high)' : '(✅ good)'}`);
        
        // Verify decryption
        const decrypted = await aesEncryption.decrypt(key, ciphertext, iv);
        const isMatch = testCase.message === decrypted;
        addLog(`   🔓 Decryption: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (!isMatch) {
          addLog(`      • Expected length: ${testCase.message.length}`);
          addLog(`      • Actual length: ${decrypted.length}`);
          addLog(`      • First difference at: ${testCase.message.split('').findIndex((char, i) => char !== decrypted[i])}`);
        }
      }
      
      // Test tampering detection
      addLog(`\\n🛡️ Testing tampering detection...`);
      const tamperMessage = "This message will be tampered with!";
      const tamperKey = await aesEncryption.generateKey(crypto.getRandomValues(new Uint8Array(32)));
      const { ciphertext: tamperCiphertext, iv: tamperIv } = await aesEncryption.encryptMessage(tamperMessage, tamperKey);
      
      // Tamper with ciphertext
      const tamperedCiphertext = new Uint8Array(tamperCiphertext);
      tamperedCiphertext[5] ^= 0xFF; // Flip bits in byte 5
      addLog(`   🔧 Tampered with byte 5 of ciphertext`);
      
      try {
        await aesEncryption.decrypt(tamperKey, tamperedCiphertext.buffer, tamperIv);
        addLog(`   ❌ SECURITY ISSUE: Tampering not detected!`);
      } catch (error) {
        addLog(`   ✅ SUCCESS: Tampering detected and rejected`);
        addLog(`   📝 Error: ${error instanceof Error ? error.message : 'Authentication failed'}`);
      }
      
    } catch (error) {
      addLog(`❌ Error during message debugging: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAESPerformance = async () => {
    setIsLoading(true);
    try {
      addLog("⚡ Testing AES-GCM performance...");
      
      const testMessage = "Performance test message. ".repeat(100); // ~2.6KB message
      const mockSharedSecret = crypto.getRandomValues(new Uint8Array(32));
      const aesKey = await aesEncryption.generateKey(mockSharedSecret);
      
      const iterations = 100;
      addLog(`🧪 Running ${iterations} encrypt/decrypt cycles`);
      addLog(`📏 Message size: ${testMessage.length} bytes`);
      
      // Encryption performance test
      const encryptStart = performance.now();
      const encryptedResults = [];
      for (let i = 0; i < iterations; i++) {
        const result = await aesEncryption.encryptMessage(testMessage, aesKey);
        encryptedResults.push(result);
      }
      const encryptEnd = performance.now();
      const encryptTime = encryptEnd - encryptStart;
      
      addLog(`✅ Encryption: ${iterations} operations in ${encryptTime.toFixed(2)}ms`);
      addLog(`⚡ Average encryption: ${(encryptTime / iterations).toFixed(2)}ms per operation`);
      
      // Decryption performance test
      const decryptStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const { ciphertext, iv } = encryptedResults[i];
        await aesEncryption.decrypt(aesKey, ciphertext, iv);
      }
      const decryptEnd = performance.now();
      const decryptTime = decryptEnd - decryptStart;
      
      addLog(`✅ Decryption: ${iterations} operations in ${decryptTime.toFixed(2)}ms`);
      addLog(`⚡ Average decryption: ${(decryptTime / iterations).toFixed(2)}ms per operation`);
      
      // Calculate throughput
      const totalTime = encryptTime + decryptTime;
      const totalOperations = iterations * 2;
      const throughputKBps = ((testMessage.length * totalOperations) / (totalTime / 1000)) / 1024;
      
      addLog(`📊 Total time: ${totalTime.toFixed(2)}ms for ${totalOperations} operations`);
      addLog(`📊 Throughput: ${throughputKBps.toFixed(2)} KB/s`);
      addLog(`📊 Operations per second: ${(totalOperations / (totalTime / 1000)).toFixed(0)}`);
      
    } catch (error) {
      addLog(`❌ Error during performance test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Key Exchange Testing Suite</CardTitle>
          <CardDescription>
            Test the key exchange functionality and debug potential issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Buttons */}
          <div className="space-y-6">
            {/* Key Exchange Tests */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">🔑 Key Exchange Tests</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={testGenerateKeys} 
                  disabled={isLoading}
                  variant="outline"
                >
                  🔑 Generate Keys
                </Button>
                
                <Button 
                  onClick={testGetPublicKey} 
                  disabled={isLoading}
                  variant="outline"
                >
                  📤 Get Public Key
                </Button>
                
                <Button 
                  onClick={testKeyExchange} 
                  disabled={isLoading}
                  variant="default"
                >
                  🤝 Test Exchange
                </Button>
                
                <Button 
                  onClick={testPersistentKeys} 
                  disabled={isLoading}
                  variant="outline"
                >
                  💾 Test Persistence
                </Button>
              </div>
            </div>

            {/* AES-GCM Tests */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-300">🔐 AES-GCM Encryption Tests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button 
                  onClick={testAESKeyGeneration} 
                  disabled={isLoading}
                  variant="outline"
                >
                  🔐 AES Key Gen
                </Button>
                
                <Button 
                  onClick={testAESEncryption} 
                  disabled={isLoading}
                  variant="outline"
                >
                  🔒 AES Encrypt
                </Button>
                
                <Button 
                  onClick={testAESFullCycle} 
                  disabled={isLoading}
                  variant="default"
                >
                  🔄 Full Cycle
                </Button>
                
                <Button 
                  onClick={testMessageDebugging} 
                  disabled={isLoading}
                  variant="outline"
                >
                  🔎 Debug Messages
                </Button>
                
                <Button 
                  onClick={testAESPerformance} 
                  disabled={isLoading}
                  variant="outline"
                >
                  ⚡ Performance
                </Button>
              </div>
            </div>

            {/* Integration Tests */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">🤝 Integration Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={testKeyExchangeWithAES} 
                  disabled={isLoading}
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  🤝🔐 ECDH + AES Integration
                </Button>
              </div>
            </div>

            {/* Utility Tests */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">🛠️ Utilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button 
                  onClick={clearStoredKeys} 
                  disabled={isLoading}
                  variant="destructive"
                >
                  🗑️ Clear Keys
                </Button>
                
                <Button 
                  onClick={clearLogs} 
                  disabled={isLoading}
                  variant="secondary"
                >
                  🧹 Clear Logs
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Testing in progress...</span>
            </div>
          )}

          {/* Logs Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 italic">No logs yet. Click a test button to start.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div 
                        key={index} 
                        className="font-mono text-sm break-all"
                        style={{
                          color: log.includes('❌') ? '#ef4444' : 
                                 log.includes('✅') || log.includes('🎉') ? '#22c55e' : 
                                 log.includes('🔍') ? '#8b5cf6' :
                                 '#6b7280'
                        }}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📖 Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">🔑 Key Exchange Tests:</p>
                  <ul className="ml-4 space-y-1">
                    <li><strong>Generate Keys:</strong> Test Ed25519 signing and X25519 encryption key generation</li>
                    <li><strong>Get Public Key:</strong> Test public key retrieval and digital signing</li>
                    <li><strong>Test Exchange:</strong> Simulate ECDH key exchange between two parties</li>
                    <li><strong>Test Persistence:</strong> Verify keys are stored and retrieved from localStorage</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300 mb-1">🔐 AES-GCM Encryption Tests:</p>
                  <ul className="ml-4 space-y-1">
                    <li><strong>AES Key Gen:</strong> Test AES-256-GCM key derivation from shared secrets</li>
                    <li><strong>AES Encrypt:</strong> Test AES-GCM encryption with random IV generation</li>
                    <li><strong>Full Cycle:</strong> Test encrypt/decrypt cycle with various message sizes and content</li>
                    <li><strong>Debug Messages:</strong> Deep analysis of encryption with different message types</li>
                    <li><strong>Performance:</strong> Benchmark encryption/decryption speed and throughput</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">🤝 Integration Tests:</p>
                  <ul className="ml-4 space-y-1">
                    <li><strong>ECDH + AES Integration:</strong> End-to-end test of key exchange + encryption</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">�️ Utilities:</p>
                  <ul className="ml-4 space-y-1">
                    <li><strong>Clear Keys:</strong> Remove all stored cryptographic keys from localStorage</li>
                    <li><strong>Clear Logs:</strong> Clear the debug log display</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}