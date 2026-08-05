#!/usr/bin/env node

/**
 * Generador de certificados SSL auto-firmados usando crypto de Node.js
 * Ejecutar: pnpm run gen-certs
 */

const fs = require('fs');
const path = require('path');

const certFile = './cert.pem';
const keyFile = './key.pem';

console.log('🔐 Generando certificados SSL auto-firmados...\n');

// Verificar si los certificados ya existen
if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    console.log('✓ Certificados ya existen.');
    console.log(`  - ${keyFile}`);
    console.log(`  - ${certFile}`);
    console.log('\nUsa: pnpm run gen-certs-force para regenerar\n');
    process.exit(0);
}

try {
    const forge = require('node-forge');
    
    console.log('🔧 Generando par de claves RSA...\n');

    // Generar un par de claves
    const keys = forge.pki.rsa.generateKeyPair(2048);

    // Crear un certificado auto-firmado
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;

    // Datos del certificado
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

    const attrs = [
        {
            name: 'commonName',
            value: 'localhost'
        },
        {
            name: 'organizationName',
            value: 'Development'
        },
        {
            shortName: 'C',
            value: 'MX'
        }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Extensions
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 2, // DNS
                    value: 'localhost'
                },
                {
                    type: 2,
                    value: '127.0.0.1'
                }
            ]
        }
    ]);

    // Auto-firmar el certificado
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convertir a PEM
    const pem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

    // Escribir archivos
    fs.writeFileSync(certFile, pem);
    fs.writeFileSync(keyFile, keyPem);

    console.log('✓ Certificados generados exitosamente:\n');
    console.log(`  📄 Clave privada: ${keyFile}`);
    console.log(`  📄 Certificado: ${certFile}`);
    console.log('\n⚠️  Certificados auto-firmados válidos por 365 días.');
    console.log('💡 Válido solo para desarrollo local.');
    console.log('🔒 Para producción, usar certificados de una CA verificada.\n');
    console.log('✅ El servidor iniciará en HTTPS automáticamente.\n');

} catch (err) {
    console.error('✗ Error generando certificados:', err.message);
    console.error('\nIntentando instalación de dependencias...\n');
    
    try {
        console.log('📦 Instalando node-forge...');
        const { execSync } = require('child_process');
        execSync('pnpm add -D node-forge', { stdio: 'inherit' });
        console.log('\n✓ Dependencia instalada. Ejecuta nuevamente: pnpm run gen-certs\n');
    } catch (e) {
        console.error('✗ No se pudo instalar la dependencia automáticamente.');
        console.error('\nEjecuta manualmente:');
        console.error('  pnpm add -D node-forge\n');
        console.error('Luego intenta de nuevo:');
        console.error('  pnpm run gen-certs\n');
    }
    
    process.exit(1);
}
