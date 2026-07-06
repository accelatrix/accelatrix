/// <reference path="./Base.ts" />

import  { Accelatrix } from './Globalization';

declare global
{
    export interface Uint8Array
    {
        /** Convert a byte array into a base64 string. */
        ToBase64(): string;

        /** Creates a string from UTF8 byte array. */
        ToUtf8String: () => string;
        
        /** Creates an hexdecimal string from the byte array. */
        ToHexString: () => string;

        /** Creates a SHA-256 hash and returns a promise-like response. */
        GetHash: () => {                         
                            then: (onfulfilled: (value: string) => void) => { catch: (onrejected: (err: Error) => void) => void },
                            catch: (onrejected: (err: Error) => void) => { then: (onfulfilled: (value: string) => void) => void },
                        };        
    }

    export interface ArrayBuffer
    {
        /** Convert a byte array into a base64 string. */
        ToBase64(): string;

        /** Creates a string from UTF8 byte array. */
        ToUtf8String: () => string;
        
        /** Creates an hexdecimal string from the byte array. */
        ToHexString: () => string;
    }

    export interface Uint8ArrayConstructor extends Uint8Array
    {
        /**
         * Converts a Base64 string into a byte array.
         * @param base64String The Base54-encoded string.
         */
        FromBase64(base64String: string): Uint8Array; 
    }

    export interface String
    {    
        /** Converts string to ANSII Byte Array. */
        ToAnsii: () => Uint8Array;
    
        /** Converts string to UTF8 Byte Array. */
        ToUtf8: () => Uint8Array;

        /** Creates a SHA-256 hash and returns a promise-like response. */
        GetHash: () => {                         
                            then: (onfulfilled: (value: string) => void) => { catch: (onrejected: (err: Error) => void) => void },
                            catch: (onrejected: (err: Error) => void) => { then: (onfulfilled: (value: string) => void) => void },
                        };
    }
    
    export interface StringConstructor extends String
    {
        /**
         * Convets UTF8 bytes back into a string.
         * @param bytes The byte array to read from.
         */
        FromBytes(bytes: Uint8Array): string;    
    }        
}

Object.defineProperty(Uint8Array, "FromBase64",
{
    value: function (base64String: string): Uint8Array
    {
        var binary_string = window.atob(base64String);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++)
        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;        
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Uint8Array.prototype, "ToBase64",
{
    value: function (): string
    {
        if (this == null || this.length == 0)
            return "";

        var arrayBuffer = this;
    
        var base64 = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
        var bytes = new Uint8Array(arrayBuffer);
        var byteLength = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength = byteLength - byteRemainder;
    
        var a, b, c, d;
        var chunk;
    
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) 
        {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1
    
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
    
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) 
        {
            chunk = bytes[mainLength];
    
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
    
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1
    
            base64 += encodings[a] + encodings[b] + '==';
        }
        else if (byteRemainder == 2) 
        {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
    
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1
    
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
    
        return base64;    
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Uint8Array.prototype, "ToUtf8String",
{
    value: function (): string
    {
        if ((<any>self)["TextDecoder"] != null)
        {
            return new TextDecoder().decode(this);
        }
    
        var result = "";
        var i = 0;
        var c,c1,c2,c3;
        c = c1 = c2 = 0;
        var utftext = <Uint8Array>this;    
    
        while (i < (<any>utftext).length)
        {
    
            c = (<any>utftext)[i]
    
            if (c < 128) {
                result += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224))
            {
                c2 = utftext[i + 1];
                result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = (<any>utftext)[i + 1];
                c3 = (<any>utftext)[i + 2];
                result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        
        return result;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Uint8Array.prototype, "ToHexString",
{
    value: function (): string
    {
        var s = '', h = '0123456789ABCDEF';
        this.forEach(v => s += h[v >> 4] + h[v & 15]);
    
        return s;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(ArrayBuffer.prototype, "ToBase64",
{
    value: function (): string
    {
        return Uint8Array.prototype.ToBase64.bind(this).apply();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(ArrayBuffer.prototype, "ToUtf8String",
{
    value: function (): string
    {
        return Uint8Array.prototype.ToUtf8String.bind(this).apply();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(ArrayBuffer.prototype, "ToHexString",
{
    value: function (): string
    {
        return Uint8Array.prototype.ToHexString.bind(this).apply();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(String, "FromBytes",
{
    value: function (bytes: Uint8Array): string
    {
        if (bytes == null) return null as any;
        if (bytes.length == 0) return "";

        //String.fromCharCode.apply(null, bytes);
        
        var out, i, len, c;
        var char2, char3;
    
        out = "";
        len = bytes.length;
        i = 0;
        while(i < len) {
        c = bytes[i++];
        switch(c >> 4)
        { 
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = bytes[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = bytes[i++];
            char3 = bytes[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
            break;
        }
        }
    
        return out;
    },
    enumerable: false,
    configurable: true,
});


Object.defineProperty(String.prototype, "ToAnsi",
{
    value: function (): Uint8Array
    {
        var array = new ((<any>self).Uint8Array !== void 0 ? Uint8Array : Array)(this.length);
        var i;
        var il;
    
        for (i = 0, il = this.length; i < il; ++i) 
        {
            array[i] = this.charCodeAt(i) & 0xff;
        }
    
        return <any>array;
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(String.prototype, "ToUtf8",
{
    value: function (): Uint8Array
    {
        if ((<any>self)["TextEncoder"] != null)
        {
            return new TextEncoder().encode(this);
        }
        else
        {
            var utf8 : string = (<any>self).unescape(encodeURIComponent(this));
            var arr = new Uint8Array(utf8.length);
    
            for (var i = 0; i < utf8.length; i++)
            {
                arr[i] = utf8.charCodeAt(i);
            }
    
            return arr;
        }
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(String.prototype, "GetHash",
{
    value: function (): string
    {
        return this.ToUtf8().GetHash();
    },
    enumerable: false,
    configurable: true,
});


Object.defineProperty(Uint8Array.prototype, "GetHash",
{
    value: function ()
    {
        var bytes = this;

        var onDone: (value: string) => void = z => {};
        var onError: (err: Error) => void = z => {};
    
        var result = {
                         then: (onfulfilled: (value: string) => void) => {
                                                                            onDone = onfulfilled == null ? z => {} : onfulfilled;
                                                                            return result;
                                                                          },
    
                         catch: (onrejected: (err:Error) => void) => {
                                                                        onError = onrejected == null ? z => {} : onrejected;
                                                                        return result;
                                                                     }
                     };
        
        if (window["msCrypto"] != null) // Internet Explorer
        {
            try
            {
                var r = window["msCrypto"].subtle.digest("SHA-256", bytes.buffer);
                
                //IE weird thing > sometimes when result.result is null
                setTimeout(() => onDone(r.result == null ? "" : r.result.ToBase64()), r.result != null ? 0 : 100);
            }
            catch(e)
            {
                setTimeout(() => onError(e), 0);
            }             
        }            
        else
        {
            if (crypto == null || crypto.subtle == null || crypto.subtle.digest == null)
            {
                onError(new Error("Cryptographic functions are not available."));
            }
            else
            {
                var digestPromise = crypto.subtle.digest("SHA-256", bytes.buffer);
                digestPromise.then(result =>
                {
                    try
                    {
                        onDone(result == null ? "" : result.ToBase64());
                    }
                    catch(e)
                    {
                        onError(e as any);
                    }                
                });
            }
        }    
    
        return result;
    },
    enumerable: false,
    configurable: true,
});
