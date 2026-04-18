export function createParticlePool(count) {
  return {
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    life: new Float32Array(count),
    maxLife: new Float32Array(count),
    cursor: 0,
  };
}

export function spawnScratchDust(pool, origin, angle, strength = 1, amount = 9) {
  for (let i = 0; i < amount; i += 1) {
    const id = pool.cursor % pool.life.length;
    const spread = (Math.random() - 0.5) * 1.4;
    const speed = (0.12 + Math.random() * 0.18) * strength;
    const a = angle + spread;

    pool.positions[id * 3] = origin[0] + (Math.random() - 0.5) * 0.04;
    pool.positions[id * 3 + 1] = origin[1] + (Math.random() - 0.5) * 0.04;
    pool.positions[id * 3 + 2] = origin[2] + 0.05 + Math.random() * 0.04;
    pool.velocities[id * 3] = Math.cos(a) * speed * 0.28;
    pool.velocities[id * 3 + 1] = Math.sin(a) * speed * 0.28 + 0.05;
    pool.velocities[id * 3 + 2] = 0.08 + Math.random() * 0.14;
    pool.maxLife[id] = 0.42 + Math.random() * 0.34;
    pool.life[id] = pool.maxLife[id];
    pool.cursor += 1;
  }
}

export function spawnAsh(pool, amount = 220) {
  for (let i = 0; i < amount; i += 1) {
    const id = pool.cursor % pool.life.length;
    const x = (Math.random() - 0.5) * 2.9;
    const y = (Math.random() - 0.5) * 4.05;
    const edgeBias = Math.random() > 0.52 ? Math.sign(x || 1) * Math.random() * 0.18 : 0;

    pool.positions[id * 3] = x + edgeBias;
    pool.positions[id * 3 + 1] = y;
    pool.positions[id * 3 + 2] = 0.12 + Math.random() * 0.08;
    pool.velocities[id * 3] = 0.5 + Math.random() * 1.6 + x * 0.18;
    pool.velocities[id * 3 + 1] = (Math.random() - 0.5) * 0.9 + y * 0.08;
    pool.velocities[id * 3 + 2] = 0.08 + Math.random() * 0.38;
    pool.maxLife[id] = 1.6 + Math.random() * 0.9;
    pool.life[id] = pool.maxLife[id];
    pool.cursor += 1;
  }
}

export function updateParticlePool(pool, delta, wind = 0) {
  for (let i = 0; i < pool.life.length; i += 1) {
    if (pool.life[i] <= 0) {
      pool.positions[i * 3 + 2] = -99;
      continue;
    }

    pool.life[i] -= delta;
    pool.velocities[i * 3] += wind * delta;
    pool.velocities[i * 3 + 1] -= 0.04 * delta;
    pool.positions[i * 3] += pool.velocities[i * 3] * delta;
    pool.positions[i * 3 + 1] += pool.velocities[i * 3 + 1] * delta;
    pool.positions[i * 3 + 2] += pool.velocities[i * 3 + 2] * delta;
  }
}

