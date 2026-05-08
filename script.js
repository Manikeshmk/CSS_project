// Interactive rotation based on mouse movement
document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    const cube = document.querySelector('.cube');
    cube.style.animation = 'none';
    cube.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});