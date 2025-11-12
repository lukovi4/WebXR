import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Root, Container, Text, DefaultProperties } from '@react-three/uikit';
import VideoGrid from './components/VideoGrid';
import VideoCarousel from './components/VideoCarousel';
import SectionTitle from './components/SectionTitle';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
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

  // Настройки заголовков секций
  sectionTitleSize: 90,
  sectionTitleBottomGap: 24,

  // Отступ между секциями
  sectionGap: 80,

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

  // Загружаем позицию хедера из localStorage
  const loadHeaderPosition = () => {
    try {
      const saved = localStorage.getItem('header-position');
      return saved || 'internal';
    } catch (error) {
      console.error('Failed to load header position:', error);
      return 'internal';
    }
  };

  // Состояние для настроек панели
  const [panelSettings, setPanelSettings] = useState(loadSettings);

  // Состояние для показа/скрытия debug панели
  const [showDebug, setShowDebug] = useState(false);

  // Состояние для passthrough режима
  const [passthroughMode, setPassthroughMode] = useState(false);

  // Состояние для размеров карточки grid (для синхронизации с carousel)
  const [gridCardWidth, setGridCardWidth] = useState(null);
  const [gridCardHeight, setGridCardHeight] = useState(null);

  // Состояние для активной страницы
  const [activePage, setActivePage] = useState('free');

  // Состояние для позиции хедера (internal/external)
  const [headerPosition, setHeaderPosition] = useState(loadHeaderPosition);

  // Callback для получения измеренных размеров карточки из VideoGrid
  const handleCardSizeMeasured = useCallback((width, height) => {
    setGridCardWidth(width);
    setGridCardHeight(height);
  }, []);

  // Сохраняем настройки в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panelSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [panelSettings]);

  // Сохраняем позицию хедера в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('header-position', headerPosition);
    } catch (error) {
      console.error('Failed to save header position:', error);
    }
  }, [headerPosition]);

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
            {/* Navigation Menu слева */}
            <group position={[-(panelSettings.panelWidth / 2) - 0.01, 0, 0.05]} rotation={[0, 0.2, 0]} renderOrder={1000}>
              <Root
                sizeX={0.1}
                sizeY={panelSettings.panelHeight}
                pixelSize={0.00035}
              >
                <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                  <NavigationMenu
                    activePage={activePage}
                    onPageChange={setActivePage}
                    settings={panelSettings}
                  />
                </DefaultProperties>
              </Root>
            </group>

            {/* Main Panel */}
            <Root
              sizeX={panelSettings.panelWidth}
              sizeY={panelSettings.panelHeight}
              pixelSize={0.00035}
            >
              <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                {/* Main container with carousel and grid */}
                <Container
                  width="100%"
                  height="100%"
                  flexDirection="column"
                  backgroundColor="#111111"
                  borderRadius={panelSettings.panelBorderRadius}
                  gap={panelSettings.sectionGap}
                  paddingTop={panelSettings.gridPaddingX}
                  paddingBottom={panelSettings.gridPaddingX}
                  overflow="scroll"
                  scrollbarWidth={0}
                >
                  {/* Header - показываем только если headerPosition === 'internal' */}
                  {headerPosition === 'internal' && (
                    <Header
                      height={250}
                      paddingX={panelSettings.gridPaddingX}
                      logoHeight={200}
                    />
                  )}

                  {/* Секция: Featured Videos */}
                  <Container flexDirection="column" width="100%" flexShrink={0}>
                    <SectionTitle
                      text="Featured Videos"
                      fontSize={panelSettings.sectionTitleSize}
                      bottomGap={panelSettings.sectionTitleBottomGap}
                      paddingX={panelSettings.gridPaddingX}
                    />
                    <VideoCarousel settings={panelSettings} cardWidth={gridCardWidth} cardHeight={gridCardHeight} />
                  </Container>

                  {/* Секция: All Videos */}
                  <Container flexDirection="column" width="100%" flexShrink={0}>
                    <SectionTitle
                      text="All Videos"
                      fontSize={panelSettings.sectionTitleSize}
                      bottomGap={panelSettings.sectionTitleBottomGap}
                      paddingX={panelSettings.gridPaddingX}
                    />
                    <VideoGrid settings={panelSettings} onCardSizeMeasured={handleCardSizeMeasured} />
                  </Container>

                  {/* Секция: Best of the Month */}
                  <Container flexDirection="column" width="100%" flexShrink={0}>
                    <SectionTitle
                      text="Best of the Month"
                      fontSize={panelSettings.sectionTitleSize}
                      bottomGap={panelSettings.sectionTitleBottomGap}
                      paddingX={panelSettings.gridPaddingX}
                    />
                    <VideoCarousel settings={panelSettings} cardWidth={gridCardWidth} cardHeight={gridCardHeight} />
                  </Container>

                  {/* Spacer снизу для отступа при скролле */}
                  <Container width="100%" height={panelSettings.gridPaddingX} flexShrink={0} />
                </Container>

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

          {/* External Header над панелью */}
          {headerPosition === 'external' && (
            <group
              position={[
                0,
                panelSettings.verticalPosition + (panelSettings.panelHeight / 2) + 0.0875 / 2 + 0.05,
                panelSettings.distance
              ]}
              rotation={[panelSettings.rotationX, 0, 0]}
            >
              <Root
                sizeX={panelSettings.panelWidth}
                sizeY={0.0875}
                pixelSize={0.00035}
              >
                <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                  <Header
                    height={250}
                    paddingX={panelSettings.gridPaddingX}
                    logoHeight={200}
                  />
                </DefaultProperties>
              </Root>
            </group>
          )}

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
                    headerPosition={headerPosition}
                    onHeaderPositionChange={setHeaderPosition}
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
