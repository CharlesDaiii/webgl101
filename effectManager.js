import * as THREE from 'three';
import { AnimationMixer, LoopOnce } from 'three';

export class EffectManager {
    constructor(scene) {
        this.scene = scene;
        this.explosionPool = [];
        this.activeExplosions = [];
        this.explosionClips = [];
        this.fireClips = [];
        this.hitSound = new Audio('./fire.wav');
        this.hitSound.volume = 0.5;
    }

    initExplosionClips(explosionModel) {
        this.explosionClips = explosionModel;
    }

    initFireClips(fireModel) {
        this.fireClips = fireModel;
    }

    createExplosionEffect(explosionModel, fireModel) {
        const group = new THREE.Group();
        const fireInst = fireModel.clone();
        const explodeInst = explosionModel.clone();

        group.add(explodeInst);
        group.add(fireInst);
        group.visible = false;
        group.userData.explodeMesh = explodeInst;
        group.userData.fireMesh = fireInst;

        return group;
    }

    hitEffect(hitPosition) {
        if (this.explosionPool.length === 0) {
            console.warn("No free explosion in pool!");
            return;
        }
        // Play sound effect
        this.hitSound.currentTime = 0; // Reset audio to start
        this.hitSound.play().catch(e => console.warn("Audio play failed:", e));
        const group = this.explosionPool.pop();
        group.visible = true;
        group.position.copy(hitPosition);
        const explodeMesh = group.userData.explodeMesh;
        const fireMesh    = group.userData.fireMesh;
        const mixer = new AnimationMixer(group);
        this.explosionClips.forEach(clip => {
            const action = mixer.clipAction(clip, explodeMesh);
            action.setLoop(LoopOnce);
            action.clampWhenFinished = true;
            action.play();
        });
        this.fireClips.forEach(clip => {
            const action = mixer.clipAction(clip, fireMesh);
            action.setLoop(LoopOnce);
            action.clampWhenFinished = true;
            action.play();
        });
        this.activeExplosions.push({ 
            mixer,
            group,
            elapsed: 0
        });
    }

    initExplosionPool(explosionModel, fireModel, poolSize = 3) {
        for(let i = 0; i < poolSize; i++) {
            const effect = this.createExplosionEffect(explosionModel, fireModel);
            this.scene.add(effect);
            this.explosionPool.push(effect);
        }
    }

    updateEffects(deltaTime) {
        this.activeExplosions.forEach((effect, index) => {
            effect.mixer.update(deltaTime);
            effect.elapsed += deltaTime;
            if(effect.elapsed > 1.0) {
                this.recycleEffect(index);
            }
        });
    }

    recycleEffect(index) {
        const effect = this.activeExplosions.splice(index, 1)[0];
        effect.group.visible = false;
        this.explosionPool.push(effect.group);
    }
}