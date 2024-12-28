import logger from "../logger";

export function isTokenExpired(token: string) {
    
    try {
        // Divide o token em suas três partes: header, payload, signature
        const payloadBase64 = token.split('.')[1]; // O payload está na segunda parte do token
        const payload = JSON.parse(atob(payloadBase64)); // Decodifica o payload de Base64 para JSON

        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            
            return payload.exp < now;
        }

        logger.error('[isTokenExpired] Token has not the "exp" property.');
        
        return true;
    } catch (error) {
        logger.error('[isTokenExpired] Failed to extract expiration of token:', error);
        
        return true;
    }
}