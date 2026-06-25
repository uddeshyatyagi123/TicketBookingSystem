package com.ticketbooking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class JwtUtil {
    private static final String SECRET = "your-very-secure-secret-key-32-chars-long-ticketbooking";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    public static String generateToken(Long userId, String email, String role) {
        try {
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("email", email);
            payload.put("role", role);
            payload.put("exp", System.currentTimeMillis() + 86400000); // 1 day expiration
            
            String headerJson = objectMapper.writeValueAsString(header);
            String payloadJson = objectMapper.writeValueAsString(payload);
            
            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            
            String signatureInput = encodedHeader + "." + encodedPayload;
            String signature = sign(signatureInput, SECRET);
            
            return signatureInput + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT", e);
        }
    }
    
    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            
            String signatureInput = parts[0] + "." + parts[1];
            String expectedSignature = sign(signatureInput, SECRET);
            if (!expectedSignature.equals(parts[2])) {
                return null;
            }
            
            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(decodedPayload, Map.class);
            
            Long exp = ((Number) claims.get("exp")).longValue();
            if (System.currentTimeMillis() > exp) {
                return null; // Token expired
            }
            return claims;
        } catch (Exception e) {
            return null;
        }
    }
    
    private static String sign(String data, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] rawHmac = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }
}
