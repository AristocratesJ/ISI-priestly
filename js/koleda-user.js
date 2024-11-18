document.addEventListener('DOMContentLoaded', () => {
    // Theme switcher functionality
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';
    let map;
    let priestMarker;
    let routeLine;

    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleSwitch.checked = currentTheme === 'dark';

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Initialize Leaflet map
    const mapElement = document.getElementById('priest-location-map');
    if (mapElement) {
        // Center map on Warsaw Praga-Północ
        map = L.map('priest-location-map').setView([52.2550, 21.0350], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom icons
        const icons = {
            priest: L.divIcon({
                html: '<i class="fas fa-cross" style="color: #dc3545; font-size: 2.5rem;"></i>',
                className: 'custom-div-icon priest-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            }),
            yourLocation: L.divIcon({
                html: '<i class="fas fa-flag" style="color: #198754; font-size: 2rem;"></i>',
                className: 'custom-div-icon',
                iconSize: [35, 35],
                iconAnchor: [17, 35]
            }),
            visitedHome: L.divIcon({
                html: '<i class="fas fa-home" style="color: #6c757d;"></i>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            nextHome: L.divIcon({
                html: '<i class="fas fa-home" style="color: #ffc107;"></i>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        };

        // Sample route data
        const route = [
            { 
                coords: [52.2547, 21.0341],
                time: '16:00',
                address: 'ul. Targowa 15/17',
                status: 'completed'
            },
            {
                coords: [52.2563, 21.0367],
                time: '16:30',
                address: 'ul. Ząbkowska 3',
                status: 'current'
            },
            {
                coords: [52.2558, 21.0399],
                time: '17:30',
                address: 'ul. Markowska 6',
                status: 'next'
            }
        ];

        // Draw route line
        const routePoints = route.map(point => point.coords);
        routeLine = L.polyline(routePoints, {
            color: 'var(--primary-color)',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        // Add markers for each location
        route.forEach((point, index) => {
            let icon;
            if (point.status === 'current') {
                icon = icons.priest;
                priestMarker = L.marker(point.coords, { icon }).addTo(map);
            } else if (point.status === 'next') {
                icon = icons.nextHome;
                L.marker(point.coords, { icon }).addTo(map);
            }
        });

        // Fit map to show route
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        // Simulate priest movement
        let currentIndex = route.findIndex(point => point.status === 'current');
        
        function updatePriestLocation() {
            if (currentIndex < route.length - 1) {
                const currentPoint = route[currentIndex];
                const nextPoint = route[currentIndex + 1];
                
                // Calculate intermediate position
                const lat = (currentPoint.coords[0] + nextPoint.coords[0]) / 2;
                const lng = (currentPoint.coords[1] + nextPoint.coords[1]) / 2;
                
                // Update priest marker position
                priestMarker.setLatLng([lat, lng]);
                
                // Update ETA and current location info
                const etaElement = document.querySelector('.eta strong');
                const locationElement = document.querySelector('.current-location strong');
                
                if (etaElement && locationElement) {
                    const minutesLeft = Math.floor(Math.random() * 20) + 10;
                    etaElement.textContent = `~${minutesLeft} minut`;
                    locationElement.textContent = currentPoint.address;
                }
            }
        }

        // Update priest location every 30 seconds
        setInterval(updatePriestLocation, 30000);

        // Add pulsing effect to priest marker
        const pulseCSS = `
            .priest-icon i {
                animation: pulse 1.5s infinite;
                filter: drop-shadow(0 0 5px rgba(220, 53, 69, 0.5));
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            .priest-path {
                stroke-dasharray: 8, 8;
                animation: dash 30s linear infinite;
            }
            @keyframes dash {
                to {
                    stroke-dashoffset: -100;
                }
            }
        `;
        const style = document.createElement('style');
        style.textContent = pulseCSS;
        document.head.appendChild(style);

        // Create animated path
        const priestPath = L.polyline(routePoints, {
            color: '#dc3545',
            weight: 4,
            opacity: 0.7,
            className: 'priest-path',
            smoothFactor: 1
        }).addTo(map);

        // Add your location marker
        const yourLocation = [52.2558, 21.0399]; // Replace with actual coordinates
        L.marker(yourLocation, { icon: icons.yourLocation }).addTo(map)
            .bindPopup('<strong>Twoja lokalizacja</strong><br>ul. Markowska 6');

        // Handle notes update
        const notesTextarea = document.querySelector('.notes-section textarea');
        const updateNotesBtn = document.querySelector('.notes-section button');

        if (updateNotesBtn) {
            updateNotesBtn.addEventListener('click', function() {
                const notes = notesTextarea.value.trim();
                if (notes) {
                    // Show loading state
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aktualizacja...';
                    
                    // Simulate API call
                    setTimeout(() => {
                        // Show success state
                        this.innerHTML = '<i class="fas fa-check"></i> Zaktualizowano';
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-success');
                        
                        // Reset after 2 seconds
                        setTimeout(() => {
                            this.disabled = false;
                            this.innerHTML = '<i class="fas fa-paper-plane"></i> Aktualizuj notatkę';
                            this.classList.remove('btn-success');
                            this.classList.add('btn-primary');
                        }, 2000);
                    }, 1000);
                }
            });
        }
    }

    // Handle rescheduling
    const rescheduleBtn = document.querySelector('[data-bs-target="#rescheduleModal"]');
    if (rescheduleBtn) {
        rescheduleBtn.addEventListener('click', function() {
            // Add rescheduling logic here
            console.log('Opening reschedule modal');
        });
    }

    // Handle responsive behavior
    function handleResponsive() {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            if (window.innerWidth < 768) {
                mapContainer.style.height = '300px';
            } else {
                mapContainer.style.height = '400px';
            }
            if (map) map.invalidateSize();
        }
    }

    window.addEventListener('resize', handleResponsive);
    handleResponsive();
}); 