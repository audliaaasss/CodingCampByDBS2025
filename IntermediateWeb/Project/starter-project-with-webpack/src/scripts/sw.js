self.addEventListener('push', (event) => {
    console.log('Service working pushing...');

    async function chainPromise() {
        await self.registration.showNotification('Ada story baru untuk Anda!', {
            body: 'Terdapat update dari User di Jakarta',
        });
    }

    event.waitUntil(chainPromise());
});