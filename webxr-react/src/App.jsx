import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Root, Container, Text, DefaultProperties } from '@react-three/uikit';

// Создаём XR store (для управления VR сессией)
const xrStore = createXRStore();

// Настройка Inter шрифта
const fontFamilies = {
  inter: [
    { path: '/fonts/Inter-Regular.ttf', weight: 400 },
    { path: '/fonts/Inter-Medium.ttf', weight: 500 },
    { path: '/fonts/Inter-Bold.ttf', weight: 700 }
  ]
};

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Кнопка "Enter VR" на экране */}
      <button
        onClick={() => xrStore.enterVR()}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
          fontWeight: 'bold'
        }}
      >
        Enter VR
      </button>

      {/* 3D Canvas - здесь всё происходит */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true }}
      >
        <XR store={xrStore}>
          {/* Освещение */}
          <ambientLight intensity={1} />

          {/* UI Panel в 2 метрах перед пользователем */}
          <group position={[0, 1.6, -2]}>
            <Root
              sizeX={2}      // 2 метра ширина
              sizeY={1}      // 1 метр высота
              pixelSize={0.001}
            >
              {/* Применяем Inter шрифт ко всему UI */}
              <DefaultProperties fontFamily="inter" fontFamilies={fontFamilies}>
                {/* Простой контейнер с текстом */}
                <Container
                  backgroundColor="#222222"
                  padding={40}
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  height="100%"
                >
                  <Text fontSize={48} color="white" fontWeight={700}>
                    Hello VR!
                  </Text>
                  <Text fontSize={24} color="#888888" marginTop={20} fontWeight={400}>
                    Your first VR prototype
                  </Text>
                </Container>
              </DefaultProperties>
            </Root>
          </group>
        </XR>
      </Canvas>
    </div>
  );
}

export default App;
