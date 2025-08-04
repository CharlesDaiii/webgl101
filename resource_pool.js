
function spawnNote(x, y, z) {
    // 检查池里有没有可用的音符
    if (notePool.length > 0) {
        const noteObj = notePool.pop(); // 从池里拿一个

        // 设置必要的状态
        noteObj.position.set(x, y, z);
        noteObj.rotation.set(0, 0, 0);
        noteObj.visible = true; 
        // 如果你要随机旋转/缩放等，也在这里设置

        // 将它加入 activeNotes，供后续更新/渲染
        activeNotes.push(noteObj);

        return noteObj;
    } else {
        // 如果池子空了，是否动态再创建1个？
        // 或者提示“音符池已满”？
        console.warn("No free notes in pool, consider increasing poolSize.");
        return null;
    }
}

function recycleNote(noteObj) {
    // 先从 activeNotes 里移除
    const idx = activeNotes.indexOf(noteObj);
    if (idx !== -1) {
        activeNotes.splice(idx, 1);
    }

    // 重置属性
    noteObj.visible = false;
    noteObj.position.set(0, -999, 0); // 随便移到场景外，不碍事

    // 如果有 trail，需要把 trail 里的粒子/顶点重置
    // 例如:
    const trail = noteObj.userData.trail;
    if (trail) {
        resetTrailGeometry(trail.geometry);
    }

    // 放回池子
    notePool.push(noteObj);
}

// 你可以写一个 resetTrailGeometry(geometry) 函数
function resetTrailGeometry(geometry) {
    // 把 buffer attribute 里位置/颜色全部清零
    const positions = geometry.attributes.position.array;
    positions.fill(0);
    geometry.attributes.position.needsUpdate = true;
}