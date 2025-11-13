import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Root, Container, Text, DefaultProperties } from '@react-three/uikit';
import VideoGrid from './components/VideoGrid';
import VideoCarousel from './components/VideoCarousel';
import SectionTitle from './components/SectionTitle';
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import FooterMenu from './components/FooterMenu';
import DebugPanel from './components/DebugPanel';
import XRModeToggle from './components/XRModeToggle';
import HeroBannerSlider from './components/HeroBannerSlider';

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

  // Настройки баннера
  bannerHeightPercent: 50, // Высота баннера в процентах от высоты панели
  bannerTitleSize: 120, // Размер заголовка баннера
  bannerDescriptionSize: 60, // Размер описания баннера

  // Настройки скролла
  scrollMultiplier: 0.5, // Множитель чувствительности скролла (0.5 = 50% sensitivity)
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

  // Загружаем состояние отображения баннера из localStorage
  const loadShowBanner = () => {
    try {
      const saved = localStorage.getItem('show-hero-banner');
      return saved === 'true'; // По умолчанию false
    } catch (error) {
      console.error('Failed to load show banner state:', error);
      return false;
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

  // Состояние для активной страницы (левое меню)
  const [activePage, setActivePage] = useState('for-you');

  // Состояние для активного элемента футер меню
  const [activeFooterItem, setActiveFooterItem] = useState('home');

  // Состояние для позиции хедера (internal/external)
  const [headerPosition, setHeaderPosition] = useState(loadHeaderPosition);

  // Состояние для показа/скрытия hero banner
  const [showHeroBanner, setShowHeroBanner] = useState(loadShowBanner);

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

  // Сохраняем состояние показа баннера в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('show-hero-banner', showHeroBanner.toString());
    } catch (error) {
      console.error('Failed to save show banner state:', error);
    }
  }, [showHeroBanner]);

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
            <group position={[-(panelSettings.panelWidth / 2) - 0.10, 0, 0.03]} rotation={[0, 0.1047, 0]} renderOrder={1000}>
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
                {/* Main wrapper with borderRadius and background */}
                <Container
                  width="100%"
                  height="100%"
                  borderRadius={panelSettings.panelBorderRadius}
                  backgroundColor="#222222"
                  overflow="hidden"
                >
                  {/* Scrollable content container */}
                  <Container
                    width="100%"
                    height="100%"
                    flexDirection="column"
                    overflow="scroll"
                    scrollbarWidth={0}
                    onScroll={(newX, newY, scrollPosition, event) => {
                      // Блокируем overscroll (rubber band) сверху
                      if (newY < 0) {
                        scrollPosition.value = [newX, 0];
                        return false;
                      }

                      // Применяем кастомный множитель только для wheel events
                      if (event && 'nativeEvent' in event && event.nativeEvent && 'deltaY' in event.nativeEvent) {
                        const ne = event.nativeEvent;
                        const currentPos = scrollPosition.value || [0, 0];

                        // Применяем scrollMultiplier
                        const scaledX = ne.deltaX * panelSettings.scrollMultiplier;
                        const scaledY = ne.deltaY * panelSettings.scrollMultiplier;

                        // Вычисляем новую позицию
                        const finalY = Math.max(0, currentPos[1] + scaledY); // Не меньше 0

                        // Обновляем позицию скролла
                        scrollPosition.value = [
                          currentPos[0] + scaledX,
                          finalY
                        ];

                        // Предотвращаем дефолтное поведение
                        return false;
                      }

                      // Для других событий (touch/drag) используем дефолтное поведение
                      return undefined;
                    }}
                  >
                    {/* Hero Banner - показываем только на странице 'for-you' если enabled */}
                    {showHeroBanner && activePage === 'for-you' && (
                      <HeroBannerSlider
                        panelHeight={panelSettings.panelHeight}
                        heightPercent={panelSettings.bannerHeightPercent}
                        borderRadius={panelSettings.panelBorderRadius}
                        padding={panelSettings.gridPaddingX}
                        settings={panelSettings}
                      />
                    )}

                    {/* Header - показываем только если headerPosition === 'internal' */}
                    {headerPosition === 'internal' && (
                      <Header
                        height={250}
                        paddingX={panelSettings.gridPaddingX}
                        logoHeight={200}
                        marginTop={showHeroBanner && activePage === 'for-you' ? 0 : panelSettings.gridPaddingX}
                        marginBottom={showHeroBanner && activePage === 'for-you' ? 0 : panelSettings.gridPaddingX}
                        isAbsolute={showHeroBanner && activePage === 'for-you'}
                      />
                    )}

                    {/* Страница: For You */}
                    {activePage === 'for-you' && (
                      <Container
                        flexDirection="column"
                        width="100%"
                        gap={panelSettings.sectionGap}
                        paddingTop={
                          showHeroBanner
                            ? panelSettings.gridPaddingX
                            : (headerPosition === 'internal' ? 0 : panelSettings.gridPaddingX)
                        }
                        paddingBottom={panelSettings.gridPaddingX}
                        flexShrink={0}
                      >
                        {/* 2. Grid: For you - 12 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="For you"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoGrid settings={panelSettings} onCardSizeMeasured={handleCardSizeMeasured} maxVideos={12} />
                        </Container>

                        {/* 3. Слайдер: SLR Originals - 12 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="SLR Originals"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoCarousel settings={panelSettings} cardWidth={gridCardWidth} cardHeight={gridCardHeight} />
                        </Container>

                        {/* 4. Слайдер: Passthrough - 12 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="Passthrough"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoCarousel settings={panelSettings} cardWidth={gridCardWidth} cardHeight={gridCardHeight} />
                        </Container>

                        {/* 5. Grid: Free VR porn - 3 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="Free VR porn"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoGrid settings={panelSettings} maxVideos={3} columns={3} />
                        </Container>

                        {/* 6. Слайдер: Interactive Videos - 12 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="Interactive Videos"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoCarousel settings={panelSettings} cardWidth={gridCardWidth} cardHeight={gridCardHeight} />
                        </Container>

                        {/* 7. Grid: You May Also Like - 12 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="You May Also Like"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoGrid settings={panelSettings} maxVideos={12} />
                        </Container>
                      </Container>
                    )}

                    {/* Страница: All VR videos */}
                    {activePage === 'all-vr-videos' && (
                      <Container
                        flexDirection="column"
                        width="100%"
                        gap={panelSettings.sectionGap}
                        paddingTop={headerPosition === 'internal' ? 0 : panelSettings.gridPaddingX}
                        paddingBottom={panelSettings.gridPaddingX}
                        flexShrink={0}
                      >
                        {/* Grid: All VR videos - все 46 видео */}
                        <Container flexDirection="column" width="100%" flexShrink={0}>
                          <SectionTitle
                            text="All VR videos"
                            fontSize={panelSettings.sectionTitleSize}
                            bottomGap={panelSettings.sectionTitleBottomGap}
                            paddingX={panelSettings.gridPaddingX}
                          />
                          <VideoGrid settings={panelSettings} onCardSizeMeasured={handleCardSizeMeasured} />
                        </Container>
                      </Container>
                    )}
                  </Container>
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

          {/* Footer Menu под панелью */}
          <group
            position={[
              0,
              panelSettings.verticalPosition - (panelSettings.panelHeight / 2) - 0.0875 / 2 - 0.05,
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
                <FooterMenu
                  activeItem={activeFooterItem}
                  onItemChange={(item) => {
                    if (item === 'profile') {
                      setShowDebug(!showDebug);
                    } else {
                      setActiveFooterItem(item);
                    }
                  }}
                  debugPanelOpen={showDebug}
                />
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
                    headerPosition={headerPosition}
                    onHeaderPositionChange={setHeaderPosition}
                    showHeroBanner={showHeroBanner}
                    onShowHeroBannerChange={setShowHeroBanner}
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
