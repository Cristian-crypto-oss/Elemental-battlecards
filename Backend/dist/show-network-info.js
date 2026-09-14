"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayNetworkInfo = void 0;
// src/show-network-info.ts
const os_1 = __importDefault(require("os"));
function getNetworkAddresses() {
    const interfaces = os_1.default.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name];
        if (!ifaceList)
            continue;
        for (const iface of ifaceList) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({ name, address: iface.address });
            }
        }
    }
    return addresses;
}
function displayNetworkInfo(port) {
    const addresses = getNetworkAddresses();
    console.log('\n' + '='.repeat(60));
    console.log('🌐 SERVIDOR BACKEND INICIADO');
    console.log('='.repeat(60));
    console.log('\n📍 Direcciones disponibles:\n');
    console.log(`   Local:     http://localhost:${port}`);
    console.log(`   Local:     http://127.0.0.1:${port}`);
    if (addresses.length > 0) {
        console.log('\n🌍 Red LAN (usa esta IP en otros dispositivos):');
        addresses.forEach((addr) => {
            console.log(`   ${addr.name.padEnd(20)} http://${addr.address}:${port}`);
        });
    }
    else {
        console.log('\n⚠️  No se encontraron interfaces de red activas');
    }
    console.log('\n📊 Endpoints disponibles:');
    console.log(`   Health Check:  http://localhost:${port}/ping`);
    console.log(`   Salas Activas: http://localhost:${port}/rooms`);
    console.log('\n' + '='.repeat(60));
    console.log('💡 Comparte la dirección de Red LAN con otros jugadores');
    console.log('='.repeat(60) + '\n');
}
exports.displayNetworkInfo = displayNetworkInfo;
//# sourceMappingURL=show-network-info.js.map