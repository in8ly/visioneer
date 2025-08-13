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

// Start the synchronized ripple sequence by tracking the traveling star
function startRippleSequence() {
    const travelingStar = document.querySelector('#traveling-star');
    if (!travelingStar) return;

    // City positions from centers.json
    const cityPositions = [
        { cx: 620, cy: 180, city: 1 }, // Toronto
        { cx: 700, cy: 250, city: 2 }, // Halifax  
        { cx: 620, cy: 320, city: 3 }, // Montréal
        { cx: 450, cy: 250, city: 4 }, // Ottawa
        { cx: 280, cy: 180, city: 5 }, // Calgary
        { cx: 200, cy: 250, city: 6 }, // Edmonton
        { cx: 280, cy: 320, city: 7 }  // Vancouver
    ];

    let lastTriggeredCity = null;
    let animationStartTime = performance.now();

    function triggerCityRipple(cityNumber) {
        // Trigger 3 ripples with slight delays for each city
        for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
                const ripple = document.querySelector(`.city-${cityNumber}-ripple-${i}`);
                if (ripple) {
                    // Reset and trigger the ripple
                    const cityCircle = document.querySelector(`#city-${cityNumber}`);
                    const baseRadius = cityCircle ? cityCircle.getAttribute('r') : '30';
                    
                    ripple.setAttribute('r', baseRadius);
                    ripple.setAttribute('opacity', '0');
                    
                    // Animate the ripple expanding and fading
                    const startRadius = parseInt(baseRadius);
                    const endRadius = startRadius + 60 + (i * 20);
                    
                    // Create smooth ripple animation
                    ripple.innerHTML = `
                        <animate attributeName="r" 
                                values="${startRadius};${endRadius}" 
                                dur="2.5s" 
                                begin="0s"/>
                        <animate attributeName="opacity" 
                                values="0.7;0.4;0" 
                                dur="2.5s" 
                                begin="0s"/>
                    `;
                }
            }, i * 300); // Stagger each ripple by 300ms
        }
    }

    function checkStarPosition() {
        const currentTime = performance.now();
        const elapsed = (currentTime - animationStartTime) % 21000; // 21 second cycle
        
        // Calculate which city the star should be near based on timing
        // The star follows this path timing approximately:
        // Toronto: 0-2.5s, Halifax: 2.5-5.5s, Montreal: 5.5-8.5s, Ottawa: 8.5-11.5s, 
        // Calgary: 11.5-14.5s, Edmonton: 14.5-17.5s, Vancouver: 17.5-21s
        
        let currentCity = null;
        if (elapsed >= 0 && elapsed < 3000) currentCity = 1;      // Toronto
        else if (elapsed >= 3000 && elapsed < 6000) currentCity = 2;   // Halifax
        else if (elapsed >= 6000 && elapsed < 9000) currentCity = 3;   // Montreal
        else if (elapsed >= 9000 && elapsed < 12000) currentCity = 4;  // Ottawa
        else if (elapsed >= 12000 && elapsed < 15000) currentCity = 5; // Calgary
        else if (elapsed >= 15000 && elapsed < 18000) currentCity = 6; // Edmonton
        else if (elapsed >= 18000) currentCity = 7;             // Vancouver

        // Trigger ripple when star reaches a new city
        if (currentCity && currentCity !== lastTriggeredCity) {
            triggerCityRipple(currentCity);
            lastTriggeredCity = currentCity;
        }

        // Reset tracking at the start of each cycle
        if (elapsed < 500) { // Reset in first 500ms of cycle
            lastTriggeredCity = null;
        }
    }

    // Check star position every 100ms for smooth tracking
    setInterval(checkStarPosition, 100);
    
    // Also reset the animation start time periodically to stay in sync
    setInterval(() => {
        animationStartTime = performance.now();
    }, 21000);
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