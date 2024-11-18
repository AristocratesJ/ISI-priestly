document.addEventListener('DOMContentLoaded', () => {
    // Theme switcher functionality
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme') || 'light';
    let map;
    let routePoints = [];

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
    const mapElement = document.getElementById('koleda-map');
    if (mapElement) {
        // Center map on Warsaw Praga-Północ
        map = L.map('koleda-map').setView([52.2550, 21.0350], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Define visit data with real Warsaw addresses
        const visits = [
            { 
                coords: [52.2547, 21.0341],
                time: '16:00',
                family: 'Kowalscy',
                address: 'ul. Targowa 15/17',
                notes: 'Dzwonek nie działa, proszę pukać',
                status: 'pending'
            },
            {
                coords: [52.2563, 21.0367],
                time: '16:30',
                family: 'Nowak',
                address: 'ul. Ząbkowska 3',
                notes: 'Drugie piętro, domofon 23',
                status: 'confirmed'
            },
            {
                coords: [52.2539, 21.0378],
                time: '17:00',
                family: 'Wiśniewscy',
                address: 'ul. Brzeska 12',
                notes: 'Wizyta odwołana - choroba',
                status: 'cancelled'
            },
            {
                coords: [52.2558, 21.0399],
                time: '17:30',
                family: 'Zielińscy',
                address: 'ul. Markowska 6',
                notes: 'Pierwszy dzwonek po prawej stronie',
                status: 'confirmed'
            },
            {
                coords: [52.2572, 21.0355],
                time: '18:00',
                family: 'Dąbrowscy',
                address: 'ul. Kłopotowskiego 9',
                notes: 'Trzecie piętro, bez windy',
                status: 'pending'
            },
            {
                coords: [52.2581, 21.0388],
                time: '18:30',
                family: 'Lewandowscy',
                address: 'ul. Okrzei 12',
                notes: 'Domofon 45, proszą o telefon przed wizytą',
                status: 'confirmed'
            },
            {
                coords: [52.2534, 21.0412],
                time: '19:00',
                family: 'Wójcik',
                address: 'ul. Mackiewicza 3/5',
                notes: 'Wizyta odwołana - wyjazd służbowy',
                status: 'cancelled'
            }
        ];

        // Custom icons for different visit statuses
        const icons = {
            pending: L.divIcon({
                html: '<i class="fas fa-home" style="color: #ffc107;"></i>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            confirmed: L.divIcon({
                html: '<i class="fas fa-home" style="color: #198754;"></i>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            }),
            cancelled: L.divIcon({
                html: '<i class="fas fa-home" style="color: #dc3545;"></i>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        };

        const markers = {};
        
        // Filter out cancelled visits and sort by time
        const activeVisits = visits.filter(visit => visit.status !== 'cancelled')
            .sort((a, b) => {
                const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
                const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
                return timeA - timeB;
            });

        // Update routePoints with active visits
        routePoints = activeVisits.map(visit => visit.coords);

        // Add markers for all visits
        visits.forEach(visit => {
            const marker = L.marker(visit.coords, {
                icon: icons[visit.status]
            }).addTo(map);

            const popupContent = `
                <div class="visit-popup">
                    <h5>${visit.family}</h5>
                    <p><i class="fas fa-clock"></i> ${visit.time}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${visit.address}</p>
                    <p><i class="fas fa-info-circle"></i> ${visit.notes}</p>
                    <p><i class="fas fa-check-circle"></i> Status: ${visit.status}</p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            markers[visit.coords.join(',')] = marker;
        });

        // Create route line
        const routeLine = L.polyline(routePoints, {
            color: 'var(--primary-color)',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        // Add start/end markers
        if (routePoints.length > 0) {
            L.marker(routePoints[0], {
                icon: L.divIcon({
                    html: '<i class="fas fa-play" style="color: #198754;"></i>',
                    className: 'custom-div-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map);

            L.marker(routePoints[routePoints.length - 1], {
                icon: L.divIcon({
                    html: '<i class="fas fa-flag-checkered" style="color: #dc3545;"></i>',
                    className: 'custom-div-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map);
        }

        // Fit map to show all markers
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        // Handle table row clicks
        document.querySelectorAll('.schedule-table tbody tr').forEach(row => {
            row.addEventListener('click', function() {
                const coords = this.dataset.coords;
                if (coords && markers[coords]) {
                    map.setView(markers[coords].getLatLng(), 16);
                    markers[coords].openPopup();
                }
            });
        });

        // Update route info - with null checks
        const routeDistance = calculateRouteDistance(routePoints);
        const visitCount = routePoints.length;
        const estimatedTime = calculateEstimatedTime(visitCount);

        // Update route info display with null checks
        const routeInfoElements = {
            distance: document.querySelector('.route-info .route-stat:nth-child(1) .stat-value'),
            time: document.querySelector('.route-info .route-stat:nth-child(2) .stat-value'),
            homes: document.querySelector('.route-info .route-stat:nth-child(3) .stat-value')
        };

        if (routeInfoElements.distance) {
            routeInfoElements.distance.textContent = `${routeDistance.toFixed(1)} km`;
        }
        if (routeInfoElements.time) {
            routeInfoElements.time.textContent = `~${estimatedTime}h`;
        }
        if (routeInfoElements.homes) {
            routeInfoElements.homes.textContent = visitCount;
        }
    }

    // Helper functions
    function calculateRouteDistance(points) {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            distance += map.distance(points[i], points[i + 1]) / 1000; // Convert to km
        }
        return distance;
    }

    function calculateEstimatedTime(visitCount) {
        // Assume 15 minutes per visit plus 5 minutes travel between visits
        const totalMinutes = (visitCount * 15) + ((visitCount - 1) * 5);
        return Math.ceil(totalMinutes / 60);
    }

    // Initialize Charts if elements exist
    const donationsChartElement = document.getElementById('donationsChart');
    if (donationsChartElement) {
        const donationsChart = new Chart(donationsChartElement.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['1 dzień', '2 dzień', '3 dzień', '4 dzień', '5 dzień'],
                datasets: [{
                    label: 'Ofiary (PLN)',
                    data: [2500, 3200, 4100, 3800, 2180],
                    borderColor: 'var(--primary-color)',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(139, 0, 0, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    const financialChartElement = document.getElementById('financialChart');
    if (financialChartElement) {
        const financialChart = new Chart(financialChartElement.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Gotówka', 'Przelewy', 'Inne'],
                datasets: [{
                    data: [12000, 3500, 280],
                    backgroundColor: [
                        'rgba(139, 0, 0, 0.8)',    // Dark red for cash
                        'rgba(212, 175, 55, 0.8)',  // Gold for transfers
                        'rgba(74, 74, 74, 0.8)'     // Gray for others
                    ],
                    borderColor: [
                        'rgba(139, 0, 0, 1)',
                        'rgba(212, 175, 55, 1)',
                        'rgba(74, 74, 74, 1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toLocaleString()} zł`;
                            }
                        }
                    }
                },
                cutout: '65%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // Handle responsive behavior
    function handleResponsive() {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            if (window.innerWidth < 768) {
                mapContainer.style.height = '400px';
            } else {
                mapContainer.style.height = '600px';
            }
            if (map) {
                map.invalidateSize();
            }
        }
    }

    window.addEventListener('resize', handleResponsive);
    handleResponsive();
}); 