function getLine() {
    const verts = [
        0, 0, 0,
        1.5, 0, 0,
        2.5, 0, 0,
    ];
    const lineGeo = new LineGeometry();
    lineGeo.setPositions(verts);
    const lineMat = new LineMaterial({
        color: 0x000000,
        linewidth: 4,
        transparent: true
    });
    lineMat.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(lineGeo, lineMat);
    line.scale.set(0, 0, 0);
    return line;
}

function createLinesGroup(centerVector3) {
    const linesGroup = new THREE.Group();
    const numLines = 100;
    for (let i = 0; i < numLines; i++) {
        const line = getLine();
        // 1) 把这条线整体放到“命中点”中心
        line.position.copy(centerVector3);

        // 2) 再对每条线随机旋转（绕自身中心）
        line.rotation.x = Math.random() * Math.PI * 2;
        line.rotation.y = Math.random() * Math.PI * 2;
        line.rotation.z = Math.random() * Math.PI * 2;

        linesGroup.add(line);
    }
    return linesGroup;
}

export function createHitEffect(centerPosition) {
    // 生成一个组，里面包含多条线
    const linesGroup = createLinesGroup(centerPosition);
    scene.add(linesGroup);

    const duration = 0.5;  // 动画时长，秒
    let elapsed = 0;

    // 用 requestAnimationFrame 实现简易插值动画
    function animateLines() {
        elapsed += 0.016;  // 近似60fps
        const ratio = elapsed / duration;

        if (ratio >= 1) {
            // 动画结束后，移除Group
            scene.remove(linesGroup);
            return;
        }

        // 1) 让每条线的scale从0 -> 1
        // 2) 线条颜色从黑(0x000000) -> 粉(0xff00ff)
        // 3) 同时让opacity从1 -> 0（或也可以保持1，不透明度看你需要）
        const newScale = ratio;  // 比如直接等于 ratio
        const newOpacity = 1.0 - ratio;  
        
        // 计算颜色插值（也可以更Fancy用HSL插值，这里直接RGB两端）
        const startColor = new THREE.Color(0x000000); 
        const endColor   = new THREE.Color(0x7A0500);
        // ratio 就是从0到1
        const currentColor = startColor.clone().lerp(endColor, ratio);

        // 更新每条线
        linesGroup.children.forEach(child => {
            // child即每条Line2
            child.scale.set(newScale, newScale, newScale);

            const mat = child.material; // LineMaterial
            mat.color.copy(currentColor);  // 设置插值颜色
            mat.opacity = newOpacity;
        });

        requestAnimationFrame(animateLines);
    }

    requestAnimationFrame(animateLines);
}