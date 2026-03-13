import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export default function Vortex({
    particleCount = 500,
    baseHue = 161,
    rangeY = 600,
    baseSpeed = 1,
    baseRadius = 1,
    backgroundColor = "transparent",
    className,
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width, height;
        let particles = [];
        let noise3D;
        try {
            noise3D = createNoise3D();
        } catch (e) {
            console.warn("simplex-noise createNoise3D failed, fallback to Math.random");
            noise3D = () => Math.random();
        }

        let tick = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        resize();
        window.addEventListener("resize", resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.life = 0;
                this.maxLife = Math.random() * 200 + 50;
                this.radius = Math.random() * baseRadius + 0.5;
                this.hue = baseHue + (Math.random() * 20 - 10);
            }
            update() {
                const noiseGen = noise3D(this.x * 0.001, this.y * 0.001, tick * 0.001);
                const angle = noiseGen * Math.PI * 2;

                this.vx += Math.cos(angle) * 0.1 * baseSpeed;
                this.vy += Math.sin(angle) * 0.1 * baseSpeed;

                this.vx *= 0.95;
                this.vy *= 0.95;

                this.x += this.vx;
                this.y += this.vy;

                this.y += (Math.random() - 0.5) * (rangeY / 100);

                this.life++;
                if (this.life >= this.maxLife || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.reset();
                }
            }
            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const alpha = Math.sin((this.life / this.maxLife) * Math.PI);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${alpha})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${alpha})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const drawBackground = () => {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        };

        let animationFrameId;

        const loop = () => {
            drawBackground();
            particles.forEach((p) => {
                p.update();
                p.draw(ctx);
            });
            tick++;
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
        };
    }, [particleCount, baseHue, rangeY, baseSpeed, baseRadius, backgroundColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full block ${className || ""}`}
            style={{ zIndex: 0 }}
        />
    );
}
