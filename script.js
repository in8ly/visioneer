function openCity(cityName) {
    console.log('Opening portal for ' + cityName);
    
    // Show which city was clicked
    var statusDiv = document.createElement('div');
    statusDiv.textContent = '✨ Connecting to ' + cityName + ' portal...';
    statusDiv.style.position = 'fixed';
    statusDiv.style.top = '20px';
    statusDiv.style.left = '50%';
    statusDiv.style.transform = 'translateX(-50%)';
    statusDiv.style.background = 'rgba(255, 215, 0, 0.1)';
    statusDiv.style.color = '#FFD700';
    statusDiv.style.padding = '12px 24px';
    statusDiv.style.borderRadius = '25px';
    statusDiv.style.border = '1px solid rgba(255, 215, 0, 0.3)';
    statusDiv.style.zIndex = '1000';
    statusDiv.style.fontSize = '14px';
    statusDiv.style.animation = 'fadeIn 0.5s ease-in';
    document.body.appendChild(statusDiv);
    
    setTimeout(function() {
        if (statusDiv.parentNode) {
            statusDiv.style.opacity = '0';
            statusDiv.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                if (statusDiv.parentNode) {
                    document.body.removeChild(statusDiv);
                }
            }, 500);
        }
    }, 2000);
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createStars);
} else {
    createStars();
}