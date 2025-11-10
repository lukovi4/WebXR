# 🔤 Как добавить русский текст и эмоджи в VR

## Проблема

@react-three/uikit использует встроенный шрифт без кириллицы.

## Решение: Добавить кастомный шрифт

### Шаг 1: Скачать шрифт с кириллицей

Рекомендую **Inter** или **Roboto** - они поддерживают кириллицу и эмоджи.

**Вариант А: Inter (рекомендую)**
```bash
# Скачай с Google Fonts
curl -o public/fonts/Inter-Regular.ttf \
  "https://github.com/rsms/inter/raw/master/fonts/ttf/Inter-Regular.ttf"
```

**Вариант Б: Roboto**
```bash
# Скачай Roboto
curl -o public/fonts/Roboto-Regular.ttf \
  "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf"
```

### Шаг 2: Создать директорию для шрифтов

```bash
mkdir -p webxr-react/public/fonts
```

### Шаг 3: Использовать шрифт в коде

```jsx
import { DefaultProperties } from '@react-three/uikit';

// В начале App.jsx, перед function App()
const fontFamilies = {
  inter: [
    { path: '/fonts/Inter-Regular.ttf', weight: 400 }
  ]
};

function App() {
  return (
    <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
      {/* Весь твой код здесь */}
      <Text fontSize={48}>
        Привет VR! 🎉
      </Text>
    </DefaultProperties>
  );
}
```

### Шаг 4: Для эмоджи

К сожалению, TTF шрифты не всегда поддерживают эмоджи хорошо.

**Решение:**
- Используй простые эмоджи: ✓ ✗ ★ ☆ ♥ → ←
- Или замени эмоджи на иконки (SVG)
- Или используй специальный emoji-шрифт (Noto Emoji)

## Быстрое решение (без шрифтов)

Просто используй английский текст - работает из коробки!

```jsx
<Text fontSize={48}>Hello VR!</Text>
<Text fontSize={24}>Your first prototype</Text>
```

## Альтернатива: HTML Canvas текстуры

Если нужен сложный текст с эмоджи, можно рендерить его в Canvas:

```jsx
import { useTexture } from '@react-three/drei';

function TextAsTexture() {
  // Создать canvas с текстом
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '48px Arial'; // Arial поддерживает эмоджи
  ctx.fillText('Привет VR! 🎉', 10, 50);

  // Использовать как текстуру
  const texture = new THREE.CanvasTexture(canvas);

  return (
    <mesh>
      <planeGeometry args={[2, 0.5]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
```

Но это сложнее и менее производительно.
