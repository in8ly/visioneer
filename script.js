
// Dynamic city circles from centers.json
fetch('centers.json')
    .then(response => response.json())
    .then(centers => {
        const svg = document.querySelector('.infinity-svg');
        centers.forEach(center => {
            // Create circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'city-circle');
            circle.setAttribute('cx', center.cx);
            circle.setAttribute('cy', center.cy);
            circle.setAttribute('r', center.r);
            circle.setAttribute('fill', 'rgba(220, 38, 38, 0.2)');
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
    });

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

if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createStars);
} else {
        createStars();
}