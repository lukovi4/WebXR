import { useEffect, useState } from 'react';
import { TextureLoader, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { useThree } from '@react-three/fiber';

// Кеш для переиспользования текстур
const textureCache = new Map();

// Очистить кеш при hot reload (для разработки)
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    clearTextureCache();
  });
}

export function useOptimizedTexture(url) {
  const [texture, setTexture] = useState(null);
  const { gl } = useThree();

  useEffect(() => {
    if (!url) return;

    // Проверяем кеш
    if (textureCache.has(url)) {
      setTexture(textureCache.get(url));
      return;
    }

    const loader = new TextureLoader();
    loader.load(
      url,
      (loadedTexture) => {
        // Получаем максимальную анизотропию для устройства (обычно 16 на Quest 3)
        const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

        // КРИТИЧНО: проверяем размер изображения
        const isPowerOf2 = (loadedTexture.image.width & (loadedTexture.image.width - 1)) === 0 &&
                          (loadedTexture.image.height & (loadedTexture.image.height - 1)) === 0;

        // Применяем оптимальные настройки для VR
        loadedTexture.anisotropy = Math.min(maxAnisotropy, 16); // Максимальная анизотропная фильтрация

        if (isPowerOf2) {
          // Power-of-2: используем mipmaps
          loadedTexture.minFilter = LinearMipmapLinearFilter;
          loadedTexture.generateMipmaps = true;
          console.log('✅ Power-of-2 текстура, mipmaps включены:', loadedTexture.image.width, '×', loadedTexture.image.height);
        } else {
          // НЕ power-of-2: mipmaps не работают, используем linear filter
          loadedTexture.minFilter = LinearFilter;
          loadedTexture.generateMipmaps = false;
          console.warn('⚠️ НЕ power-of-2! Mipmaps ОТКЛЮЧЕНЫ:', loadedTexture.image.width, '×', loadedTexture.image.height);
        }

        loadedTexture.magFilter = LinearFilter; // Линейная фильтрация при увеличении
        loadedTexture.colorSpace = SRGBColorSpace; // Правильная цветопередача (новый API)

        // Сохраняем в кеш для переиспользования
        textureCache.set(url, loadedTexture);
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', url, error);
      }
    );

    return () => {
      // НЕ удаляем из кеша при unmount - переиспользуем
    };
  }, [url, gl]);

  return texture;
}

// Функция для очистки кеша (вызывать при смене контента)
export function clearTextureCache() {
  textureCache.forEach((texture) => texture.dispose());
  textureCache.clear();
}
