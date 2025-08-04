import * as THREE from 'three';

export class ComboEffect {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.currentLevel = 0;
        this.colors = [
            new THREE.Color('#ff00ff'),
            new THREE.Color('#00ffff'),
            new THREE.Color('#ffaa00'),
            new THREE.Color('#00ff00')
        ];
        this.currentColorIndex = 0;
    }

    triggerComboEffect(combo) {
        const comboLevel = Math.min(Math.floor(combo / 5), 4);
        this.cameraShake(comboLevel * 0.3);
        if (combo % 5 === 0) {
            this.showComboText(combo);
        }
        this.scene.updateBackground(combo);
    }

    cameraShake(intensity) {
        const originalX = this.camera.position.x;
        const originalY = this.camera.position.y;

        gsap.to(this.camera.position, {
            x: "+=" + (Math.random()*intensity-intensity/2),
            y: "+=" + (Math.random()*intensity-intensity/2),
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
            onComplete: () => {
                gsap.to(this.camera.position, {
                    x: originalX,
                    y: originalY,
                    duration: 0.3
                });
            }
        });
    }

    showComboText(combo) {
        const texts = ['AWESOME!', 'GREAT!!', 'AMAZING!!!', 'UNBELIEVABLE!!!!'];
        const textElem = document.createElement('div');
        textElem.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${4 + Math.floor(combo/5)}em;
            color: ${this.colors[this.currentColorIndex]};
            font-family: 'Impact';
            text-shadow: 0 0 20px rgba(255,255,255,0.5);
            opacity: 0;
            transition: all 0.5s;
            pointer-events: none;
        `;
        textElem.textContent = texts[Math.floor(Math.random()*texts.length)] + " " + combo + "X";
        document.getElementById('ui').appendChild(textElem);
    
        gsap.to(textElem, {
            opacity: 0.8,
            fontSize: '6em',
            duration: 0.5,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (textElem && textElem.parentNode) {
                    textElem.parentNode.removeChild(textElem);
                }
            }
        });
    }
}


