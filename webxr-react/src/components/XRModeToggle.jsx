import { useEffect, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function XRModeToggle({ passthroughMode, setPassthroughMode, onToggle }) {
  const { gl, scene } = useThree();
  const passthroughModeRef = useRef(passthroughMode);
  const blackSphereRef = useRef(null);

  // Обновляем ref при изменении passthroughMode
  useEffect(() => {
    passthroughModeRef.current = passthroughMode;
  }, [passthroughMode]);

  // Создаем инвертированную черную сферу вокруг камеры (skybox blocker)
  useEffect(() => {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
      fog: false
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.renderOrder = -999;
    sphere.frustumCulled = false;
    sphere.visible = true; // По умолчанию видна (passthrough заблокирован)

    blackSphereRef.current = sphere;
    scene.add(sphere);

    return () => {
      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  // Функция для применения настроек passthrough
  const applyPassthroughSettings = useCallback((mode) => {
    if (blackSphereRef.current) {
      blackSphereRef.current.visible = !mode;
    }
    scene.background = null;
  }, [scene]);

  // Слушатель XR сессии - применяем настройки после старта
  useEffect(() => {
    const onSessionStart = () => {
      setTimeout(() => {
        applyPassthroughSettings(passthroughModeRef.current);
      }, 100);
    };

    gl.xr.addEventListener('sessionstart', onSessionStart);
    return () => gl.xr.removeEventListener('sessionstart', onSessionStart);
  }, [gl, applyPassthroughSettings]);

  // Обработчик переключения
  const handleToggle = useCallback(() => {
    const newMode = !passthroughMode;
    applyPassthroughSettings(newMode);
    setPassthroughMode(newMode);
  }, [passthroughMode, setPassthroughMode, applyPassthroughSettings]);

  // Синхронизация при изменении состояния извне
  useEffect(() => {
    applyPassthroughSettings(passthroughMode);
  }, [passthroughMode, applyPassthroughSettings]);

  // Регистрация обработчика
  useEffect(() => {
    if (onToggle) {
      onToggle(handleToggle);
    }
  }, [handleToggle, onToggle]);

  return null;
}
