import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Root, Container, Text, DefaultProperties } from '@react-three/uikit';
import VideoGrid from './components/VideoGrid';
import DebugPanel from './components/DebugPanel';
import XRModeToggle from './components/XRModeToggle';

// Создаём XR store с поддержкой passthrough
// Quest native scale factor: 1.4222, но для supersampling используем 2.5
const xrStore = createXRStore({
  emulate: false,
  frameBufferScaling: 2.5, // Увеличенный supersampling для лучшего качества клиппинга
});

// Дефолтные настройки (Variant B)
const DEFAULT_SETTINGS = {
  panelWidth: 1.41,
  panelHeight: 0.79,
  verticalPosition: 1.2,
  distance: -1.5,
  rotationX: -0.1, // Угол наклона панели (в радианах)

  // Настройки дизайна карточек
  cardTitleSize: 40,
  cardDescriptionSize: 24,
  cardDurationSize: 24,
  cardPreviewTitleGap: 8,
  cardTitleDescriptionGap: 8,
  cardImageBorderRadius: 8,

  // Настройки отступов грида
  gridPaddingX: 40,
  gridCardGap: 32,
  gridRowGap: 40,

  // Настройки панели
  panelBorderRadius: 8,
};

// Ключ для localStorage
const STORAGE_KEY = 'vr-panel-settings';

// Настройка Inter MSDF шрифтов (Medium и Semi-Bold)
const fontFamilies = {
  inter: {
    medium: '/fonts/inter-medium.json',
    'semi-bold': '/fonts/inter-semi-bold.json'
  }
};

function App() {
  // Загружаем настройки из localStorage или используем дефолтные
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge с дефолтными настройками (для обратной совместимости)
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  };

  // Состояние для настроек панели
  const [panelSettings, setPanelSettings] = useState(loadSettings);

  // Состояние для показа/скрытия debug панели
  const [showDebug, setShowDebug] = useState(false);

  // Состояние для passthrough режима
  const [passthroughMode, setPassthroughMode] = useState(false);

  // Сохраняем настройки в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panelSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [panelSettings]);

  // Ссылка на функцию переключения (будет установлена из XRModeToggle)
  const toggleHandlerRef = useRef(null);

  // Переключение между VR и AR (passthrough) режимами
  const togglePassthrough = () => {
    console.log('Toggle passthrough clicked!');

    if (toggleHandlerRef.current) {
      toggleHandlerRef.current();
    } else {
      console.warn('Toggle handler not ready yet');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Кнопка "Enter AR" на экране */}
      <button
        onClick={() => xrStore.enterAR()}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#4ade80',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
          fontWeight: 'bold'
        }}
      >
        Enter AR
      </button>

      {/* 3D Canvas - здесь всё происходит */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        dpr={window.devicePixelRatio}
        flat
        frameloop="always"
        gl={{
          antialias: true,
          alpha: true,  // Включаем прозрачность для passthrough
          powerPreference: 'high-performance',
          precision: 'highp',
          toneMapping: 0, // THREE.NoToneMapping
          localClippingEnabled: true, // Для uikit
          stencil: true, // Улучшает качество клиппинга
          depth: true // Улучшает depth buffer для клиппинга
        }}
        onCreated={({ gl }) => {
          // Best practice от pmndrs: setPixelRatio для sharp rendering
          gl.setPixelRatio(window.devicePixelRatio);
        }}
      >
        <XR store={xrStore} foveation={0}>
          {/* XR Mode Toggle Controller */}
          <XRModeToggle
            passthroughMode={passthroughMode}
            setPassthroughMode={setPassthroughMode}
            onToggle={(handler) => {
              toggleHandlerRef.current = handler;
            }}
          />

          {/* Освещение */}
          <ambientLight intensity={passthroughMode ? 1.5 : 1} />

          {/* Основная панель с настраиваемыми параметрами */}
          <group
            position={[0, panelSettings.verticalPosition, panelSettings.distance]}
            rotation={[panelSettings.rotationX, 0, 0]}
          >
            <Root
              sizeX={panelSettings.panelWidth}
              sizeY={panelSettings.panelHeight}
              pixelSize={0.00035}
            >
              <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                {/* Грид с видео */}
                <VideoGrid settings={panelSettings} />

                {/* Кнопка Settings в правом нижнем углу */}
                <Container
                  position="absolute"
                  bottom={24}
                  right={24}
                  width={80}
                  height={80}
                  backgroundColor={showDebug ? '#4a9eff' : '#333333'}
                  borderRadius={12}
                  justifyContent="center"
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  <Text fontSize={32} color="white" fontWeight={600}>
                    ⚙️
                  </Text>
                </Container>
              </DefaultProperties>
            </Root>
          </group>

          {/* Debug Panel */}
          {showDebug && (
            <group position={[-0.6, 0.5, -1]}>
              <Root sizeX={0.42} sizeY={0.7} pixelSize={0.001}>
                <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                  <DebugPanel
                    settings={panelSettings}
                    onUpdate={setPanelSettings}
                    onClose={() => setShowDebug(false)}
                    passthroughMode={passthroughMode}
                    togglePassthrough={togglePassthrough}
                  />
                </DefaultProperties>
              </Root>
            </group>
          )}
        </XR>
      </Canvas>
    </div>
  );
}

export default App;
