self.addEventListener('push', (event) => {
    console.log('Service worker pushin...');

    async function chainPromise() {
        await self.registration.showNotification('Ada laporan baru untuk Anda!', {
            body: 'Terjadi kerusakan lampu jalan di Jl. Melati',
        });
    }

    event.waitUntil(chainPromise());
});