// Dynamic city circles from centers.json
document.addEventListener('DOMContentLoaded', () => {
    fetch('centers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(centers => {
            const svg = document.querySelector('.infinity-svg');
            if (!svg) {
                console.error('SVG container not found');
                return;
            }

            centers.forEach((center, index) => {
                // Create circle
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'city-circle');
                circle.setAttribute('id', `city-${index + 1}`);
                circle.setAttribute('cx', center.cx);
                circle.setAttribute('cy', center.cy);
                circle.setAttribute('r', center.r);
                circle.setAttribute('fill', center.fill); 
                circle.setAttribute('stroke', center.color);
                circle.setAttribute('stroke-width', '2');
                circle.style.cursor = 'pointer';
                
                circle.addEventListener('click', () => {
                    if (center.url) {
                        window.open(center.url, '_blank');
                    }
                    // Gentle pulse effect
                    circle.setAttribute('filter', 'url(#glow)');
                    setTimeout(() => circle.removeAttribute('filter'), 600);
                });
                svg.appendChild(circle);

                // Create ripple elements for each city
                createCityRipples(svg, center, index);

                // Add city name
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('class', 'city-text');
                text.setAttribute('x', center.cx);
                text.setAttribute('y', center.cy - 7);
                text.textContent = center.name;
                svg.appendChild(text);

                // Add bioregion
                const bio = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                bio.setAttribute('class', 'bioregion-text');
                bio.setAttribute('x', center.cx);
                bio.setAttribute('y', center.cy + 8);
                bio.textContent = center.bioregion;
                svg.appendChild(bio);
            });

            // Start the synchronized ripple sequence
            startRippleSequence();
        })
        .catch(error => console.error('Error fetching or parsing centers.json:', error));

    createStars();
});

// Create ripple elements for each city
function createCityRipples(svg, center, cityIndex) {
    // Create 3 concentric ripples for each city
    for (let i = 0; i < 3; i++) {
        const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ripple.setAttribute('cx', center.cx);
        ripple.setAttribute('cy', center.cy);
        ripple.setAttribute('r', center.r);
        ripple.setAttribute('fill', 'none');
        ripple.setAttribute('stroke', center.color);
        ripple.setAttribute('stroke-width', '2');
        ripple.setAttribute('opacity', '0');
        ripple.setAttribute('class', `ripple city-${cityIndex + 1}-ripple-${i + 1}`);
        svg.appendChild(ripple);
    }
}

// Start the synchronized ripple sequence
function startRippleSequence() {
    // Tour sequence timing (21 seconds total, 7 cities)
    // Toronto(0s) → Halifax(3s) → Montréal(6s) → Ottawa(9s) → Calgary(12s) → Edmonton(15s) → Vancouver(18s)
    const citySequence = [
        { city: 1, delay: 0 },     // Toronto
        { city: 2, delay: 3000 },  // Halifax  
        { city: 3, delay: 6000 },  // Montréal
        { city: 4, delay: 9000 },  // Ottawa
        { city: 5, delay: 12000 }, // Calgary
        { city: 6, delay: 15000 }, // Edmonton
        { city: 7, delay: 18000 }  // Vancouver
    ];

    function triggerCityRipple(cityNumber) {
        // Trigger 3 ripples with slight delays for each city
        for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
                const ripple = document.querySelector(`.city-${cityNumber}-ripple-${i}`);
                if (ripple) {
                    // Reset the ripple
                    ripple.setAttribute('r', ripple.previousElementSibling?.getAttribute('r') || '30');
                    ripple.setAttribute('opacity', '0.6');
                    
                    // Animate the ripple expanding and fading
                    const startRadius = parseInt(ripple.getAttribute('r'));
                    const endRadius = startRadius + 60 + (i * 20);
                    
                    // Create smooth ripple animation
                    ripple.innerHTML = `
                        <animate attributeName="r" 
                                values="${startRadius};${endRadius}" 
                                dur="2s" 
                                begin="0s"/>
                        <animate attributeName="opacity" 
                                values="0.6;0.3;0" 
                                dur="2s" 
                                begin="0s"/>
                    `;
                }
            }, i * 200); // Stagger each ripple by 200ms
        }
    }

    // Start the sequence and repeat every 21 seconds
    function runSequence() {
        citySequence.forEach(({ city, delay }) => {
            setTimeout(() => triggerCityRipple(city), delay);
        });
    }

    // Start immediately and repeat every 21 seconds
    runSequence();
    setInterval(runSequence, 21000);
}

// Create subtle stars (fewer, more contemplative)
function createStars() {
    for (var i = 0; i < 30; i++) {
        var star = document.createElement('div');
        star.style.position = 'fixed';
        star.style.width = '1px';
        star.style.height = '1px';
        star.style.backgroundColor = '#FFD700';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.opacity = Math.random() * 0.3;
        star.style.animation = 'twinkle ' + (Math.random() * 5 + 3) + 's ease-in-out infinite';
        star.style.pointerEvents = 'none';
        document.body.appendChild(star);
    }
}