const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, scrollPos = 0, targetScroll = 0;
let entities = [];
let particles = [];

// Advanced Entity Shapes
const SHAPES = {
    STATION: (c, s) => {
        c.fillRect(-s, -s/10, s*2, s/5); // Main ring
        c.strokeRect(-s/4, -s, s/2, s*2); // Spire
        c.beginPath(); c.arc(0, 0, s/3, 0, Math.PI*2); c.fill(); // Core
    },
    ASTEROID: (c, s) => {
        c.beginPath();
        for(let i=0; i<10; i++) {
            const r = s * (0.7 + Math.random() * 0.3);
            const a = (i/10) * Math.PI * 2;
            c.lineTo(Math.cos(a)*r, Math.sin(a)*r);
        }
        c.closePath(); c.fill();
    },
    PROBE: (c, s) => {
        c.beginPath(); c.moveTo(0, -s); c.lineTo(s, s); c.lineTo(-s, s); c.closePath(); c.fill();
        c.fillRect(-s*1.2, 0, s*2.4, s/8); // Panels
    }
};

class Entity {
    constructor(z) {
        this.reset(z);
    }

    reset(z) {
        this.z = z;
        this.x = (Math.random() - 0.5) * 40;
        this.y = (Math.random() - 0.5) * 20;
        this.size = 20 + Math.random() * 40;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
        this.type = Object.values(SHAPES)[Math.floor(Math.random() * 3)];
        this.driftX = (Math.random() - 0.5) * 0.01;
        this.driftY = (Math.random() - 0.5) * 0.01;
    }

    update() {
        this.rotation += this.rotSpeed;
        this.x += this.driftX;
        this.y += this.driftY;
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    entities = [];
    particles = [];

    for(let i=0; i<80; i++) entities.push(new Entity(i * 15));
    for(let i=0; i<300; i++) particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        s: Math.random() * 2
    });
}

function render() {
    // 1. Draw Deep Space Gradient
    const bgGrd = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width);
    bgGrd.addColorStop(0, '#050a15');
    bgGrd.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Dust Particles
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.fillRect(p.x, p.y, p.s, p.s);
    });

    // 3. Process 3D Entities
    scrollPos += (targetScroll - scrollPos) * 0.05; // Smooth Camera LERP
    
    // Painter's Algorithm: Draw furthest first
    const visible = entities
        .map(e => {
            const relZ = e.z - scrollPos;
            const scale = 800 / (800 + relZ * 60);
            return { e, relZ, scale };
        })
        .filter(v => v.relZ > -10 && v.relZ < 150)
        .sort((a, b) => b.relZ - a.relZ);

    visible.forEach(v => {
        const { e, scale } = v;
        const px = e.x * scale * 100 + width / 2;
        const py = e.y * scale * 100 + height / 2;

        e.update();

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(e.rotation);
        ctx.scale(scale, scale);

        // Volumetric Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, e.size);
        glow.addColorStop(0, 'rgba(0, 242, 255, 0.2)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, 0, e.size * 2, 0, Math.PI*2); ctx.fill();

        // Object Body
        ctx.strokeStyle = `rgba(0, 242, 255, ${scale})`;
        ctx.fillStyle = `rgba(10, 10, 20, ${scale})`;
        ctx.lineWidth = 2;
        e.type(ctx, e.size);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    });

    // Update HUD
    document.getElementById('val-z').innerText = Math.floor(scrollPos * 10);
    document.getElementById('val-x').innerText = Math.floor(Math.sin(scrollPos * 0.1) * 100);

    requestAnimationFrame(render);
}

window.addEventListener('scroll', () => { targetScroll = window.scrollY / 50; });
window.addEventListener('resize', init);

init();
render();