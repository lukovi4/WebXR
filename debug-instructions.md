# 🔧 Удалённая отладка VR приложения

## Для Meta Quest через Chrome DevTools

### 1. Установить ADB (Android Debug Bridge)

```bash
brew install android-platform-tools
```

### 2. Настроить Quest

1. Надень Quest
2. Settings → System → Developer
3. Включи:
   - USB Connection Dialog
   - USB Debugging

### 3. Подключить Quest через USB

1. Подключи USB-C кабель Quest → MacBook
2. В Quest появится запрос "Allow USB Debugging?"
3. Нажми "Always allow from this computer"

### 4. Проверить подключение

```bash
adb devices
```

Должен показать:
```
List of devices attached
1WMHH8xxxxxx    device
```

### 5. Открыть Chrome DevTools на компьютере

1. Открой Chrome на компьютере
2. Перейди на: `chrome://inspect#devices`
3. Включи "Discover USB devices"
4. Открой сайт в Quest Browser: https://192.168.50.229:5173
5. В Chrome DevTools появится "Quest Browser" с открытыми вкладками
6. Нажми "inspect" рядом с твоей вкладкой

### Теперь у тебя есть:

- ✅ Console - видишь все console.log() из VR
- ✅ Network - мониторинг запросов
- ✅ Performance - профилирование
- ✅ Sources - можешь ставить breakpoints!

## Для Apple Vision Pro через Safari

### 1. Включить Web Inspector в Vision Pro

1. Settings → Apps → Safari → Advanced
2. Включи "Web Inspector"

### 2. Включить Developer Menu в Safari на Mac

1. Safari на Mac → Settings → Advanced
2. Включи "Show Develop menu in menu bar"

### 3. Подключить через WiFi

1. Открой сайт в Safari на Vision Pro
2. В Safari на Mac → Develop → [Your Vision Pro Name]
3. Выбери открытую вкладку
4. Откроется Web Inspector!

## Горячие клавиши для быстрой разработки

### В DevTools:

- `Cmd + Shift + C` - Element picker
- `Cmd + K` - Clear console
- `Cmd + P` - Quick open file
- `Cmd + Shift + M` - Toggle device toolbar

### Полезные команды в Console:

```javascript
// Перезагрузить страницу в VR
location.reload()

// Проверить поддержку WebXR
navigator.xr.isSessionSupported('immersive-vr')

// Получить текущую XR сессию
xrSession
```

## Troubleshooting

### Quest не виден в chrome://inspect

1. Проверь USB кабель (должен поддерживать data transfer)
2. Проверь `adb devices` - должно быть "device", не "unauthorized"
3. Перезагрузи Quest
4. Попробуй другой USB порт

### Vision Pro не появляется в Safari Develop

1. Убедись что Vision Pro и Mac в одной WiFi сети
2. Перезагрузи Safari на обоих устройствах
3. Проверь что Web Inspector включен на Vision Pro

### Сертификат не принимается

Если браузер в VR не принимает HTTPS сертификат:

```bash
cd webxr-react
# Сгенерируй новый сертификат
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Затем обнови vite.config.js:

```javascript
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    }
  }
})
```
