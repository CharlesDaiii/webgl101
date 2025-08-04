import * as THREE from 'three';

export class NoteManager {
    constructor(scene, notePoolSize = 10) {
        this.scene = scene;
        this.notePool = [];
        this.activeNotes = [];
        this.poolSize = notePoolSize;
        this.lanes = [-5, 0, 5];
        this.noteSpeed = 0.05;
        this.combo = 0;
    }

    createTrail(initialPosition) {
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(300 * 3);  // 每个音符的粒子数
        for (let i = 0; i < trailPositions.length; i += 3) {
            trailPositions[i] = 0;
            trailPositions[i + 1] = -999;
            trailPositions[i + 2] = 0;
            
        }

        const trailColors = new Float32Array(300 * 3);
        for (let i = 0; i < trailColors.length; i += 3) {
            const color = new THREE.Color();
            color.setHSL(i / trailColors.length, 1.0, 0.5);  // 彩虹色
            trailColors[i] = color.r;
            trailColors[i + 1] = color.g;
            trailColors[i + 2] = color.b;
        }

        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

        const trailMaterial = new THREE.PointsMaterial({
            size: 3.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.05,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Points(trailGeometry, trailMaterial);
    }

    createNote(model) {
        if (!model) {
            console.warn("模型尚未加载完成");
            return null;
        }
        const initialPos = new THREE.Vector3(
            this.lanes[Math.floor(Math.random() * this.lanes.length)],
            15,
            0
        );
        const group = new THREE.Group();
        const note = model.clone();
        const trail = this.createTrail(initialPos);
        group.add(note);
        group.add(trail);
        group.userData.rotatex = Math.random() * 0.1 - 0.05;
        group.userData.rotatey = Math.random() * 0.1 - 0.05;
        group.userData.rotatez = Math.random() * 0.1 - 0.05;
        group.userData.trail = trail; 
        group.userData.noteMesh = note;
        group.userData.noteMesh.visible = false;
        group.userData.trail.visible = false;
        return group;
    }

    initPool(model) {
        for(let i = 0; i < this.poolSize; i++) {
            const note = this.createNote(model);
            this.scene.add(note);
            this.notePool.push(note);
        }
    }

    spawnNote(laneIndex) {
        const x = this.lanes[laneIndex];
        const y = 15;
        const z = 0;
        if(this.notePool.length === 0) return null;
        
        const note = this.notePool.pop();
        note.userData.noteMesh.position.set(x, y, z);
        note.userData.noteMesh.rotation.set(0, 0, 0);
        note.userData.noteMesh.visible = true; 
        this.activeNotes.push(note);
        return note;
    }

    updateNotes() {
        this.activeNotes.forEach((note, index) => {
            note.userData.noteMesh.position.y -= this.noteSpeed;
            note.userData.noteMesh.rotation.x += note.userData.rotatex;
            note.userData.noteMesh.rotation.y += note.userData.rotatey;
            note.userData.noteMesh.rotation.z += note.userData.rotatez;
            this.updateTrail(note);

            if(note.userData.noteMesh.position.y < -1) {
                this.recycleNote(index);
                this.combo = 0;
                this.scene.updateBackground(this.combo);
                document.getElementById('combo').style.display = 'none';
            }
        });
    }

    resetTrailGeometry(geometry){
        const posArr = geometry.attributes.position.array;
        const colorArr = geometry.attributes.color.array;
        for (let i = 0; i < posArr.length; i += 3) {
            posArr[i] = 0;       // x
            posArr[i + 1] = -999; // y (移出可视范围)
            posArr[i + 2] = 0;    // z
        }
        for (let i = 0; i < colorArr.length; i += 3) {
            const color = new THREE.Color();
            color.setHSL(i / colorArr.length, 1.0, 0.5);  // 彩虹色
            colorArr[i] = color.r;
            colorArr[i + 1] = color.g;
            colorArr[i + 2] = color.b;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    }

    recycleNote(index) {
        const note = this.activeNotes.splice(index, 1)[0];
        note.userData.noteMesh.visible = false;
        this.resetTrailGeometry(note.userData.trail.geometry);
        this.notePool.push(note);
    }

    updateTrail(note) {
        const positions = note.userData.trail.geometry.attributes.position.array;
        const colors    = note.userData.trail.geometry.attributes.color.array;

        // 只有当note可见时才给第一个粒子位置
        // if (note.userData.noteMesh.visible) {
        note.userData.trail.visible = true;
        // 让每个粒子位置往后移
        for (let i = positions.length - 3; i >= 3; i -= 3) {
            positions[i]     = positions[i - 3];
            positions[i + 1] = positions[i - 2];
            positions[i + 2] = positions[i - 1];

            // 让旧粒子逐渐淡出
            colors[i]   *= 0.98;
            colors[i+1] *= 0.98;
            colors[i+2] *= 0.98;
        }
        const currentPos = note.userData.noteMesh.position;
        positions[0] = currentPos.x;
        positions[1] = currentPos.y;
        positions[2] = currentPos.z;

        // 改小一点的颜色
        colors[0] = 0.2;
        colors[1] = 0.7;
        colors[2] = 0.7;
        // } else {
        //     note.userData.trail.visible = false;
        // }

        note.userData.trail.geometry.attributes.position.needsUpdate = true;
        note.userData.trail.geometry.attributes.color.needsUpdate = true;
    }
}